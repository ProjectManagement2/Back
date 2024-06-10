import jwb from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import UserModel from '../models/User.js';
import OrganizationModel from '../models/Organization.js';
import PermissionModel from '../models/Permission.js';

export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({email: req.body.email});

        // проверка email
        if (!user) {
            return res.status(400).json({
                message: 'У вас нет прав администратора'
            });
        }

        // проверка пароля
        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

        if (!isValidPass) {
            return res.status(400).json({
                message: 'У вас нет прав администратора'
            });
        }

        //проверка, является ли пользователь администратором
        // const isAdmin = user._doc.isAdmin;
        // if (isAdmin == false) {
        //     return res.status(400).json({
        //         message: 'У вас нет прав администратора'
        //     })
        // }

        //создание токена
        const token = jwb.sign({
            _id: user._id
        },
        'secret',
        {
            expiresIn: '30d'
        }
        );

        res.json({
            ...user._doc,
            token
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось авторизоваться'
        });
    }
};

export const createOrganization = async (req, res) => {
    try {
        //проверка лидера организации
        const leader = await UserModel.findById(req.body.leaderId);
        if (!leader) {
            return res.status(404).json({
                message: 'Пользователь не найден'
            });
        }

        //создание новой записи организации
        const doc = new OrganizationModel({
            name: req.body.name,
            description: req.body.description,
            leader: leader._doc._id,
        });
        const organization = await doc.save();

        //добавление организации в список пользователя
        UserModel.findOneAndUpdate(
            { _id: leader._doc._id }, 
            { $push: { organizations: organization } }
        ).exec();

        //добавление пользователю право доступа в организации
        const doc_permisson = new PermissionModel({
            organization: organization._doc._id,
            role: 'OrganizationLeader',
            user: leader._doc._id,
        });
        const permission = await doc_permisson.save();

        res.json({
            message: 'Создана новая организация'
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось создать организацию'
        });
    }
    
};

export const getAllOrganizations = async (req, res) => {
    try {
        const organizations = await OrganizationModel.find({}).select('_id name leader')
        .populate({
            path: 'leader',
            select: '_id surname name otch',
            });
        return res.json(organizations);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить данные'
        });
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find({}).select('_id surname name otch');
        return res.json(users);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить данные'
        });
    }
}

export const updateOrganization = async (req, res) => {
    try {
        const updatedOrganization = await OrganizationModel.findByIdAndUpdate(
            {_id: req.body.organizationId},
            {
                name: req.body.name,
                description: req.body.description
            }
        );
        res.json({message: 'Данные обновлены'});
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось обновить данные'
        });
    }
}

export const deleteOrganization = async (req, res) => {
    try {
        const organizationId = req.headers.organizationid;

        // поиск организации
        const organization = await OrganizationModel.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ message: 'Организация не найдена' });
        }

        // удаление организации из списков пользователей
        await UserModel.updateMany(
            { organizations: organizationId },
            { $pull: { organizations: organizationId } }
        ).exec();

        await OrganizationModel.findByIdAndDelete(organizationId);

        res.json({
            message: 'Организация удалена'
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось удалить организацию'
        });
    }
}