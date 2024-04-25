import ProjectModel from '../models/Project.js'
import PermissionModel from '../models/Permission.js';
import OrganizationModel from '../models/Organization.js';
import UserModel from '../models/User.js';


export const mainInfo = async (req, res) => {
    try {
        // поиск организации, в которой состоит пользователь
        const organization = await OrganizationModel.findById(req.body.organizationId);
        if (!organization) {
            return res.status(404).json({
                message: 'Организация не найдена'
            });
        }

        return res.json(organization);
    }
    catch {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить информацию об организации'
        });
    }
}

export const createProject = async (req, res) => {
    try {
        // поиск организации, в которой состоит пользователь
        const organization = await OrganizationModel.findById(req.body.organizationId);
        if (!organization) {
            return res.status(404).json({
                message: 'Организация не найдена'
            });
        }

        // просмотр разрешения на создание проекта
        const permission = await PermissionModel.findOne({user: req.userId, organization: organization._doc._id, role: 'OrganizationLeader'});
        if (!permission) {
            return res.status(404).json({
                message: 'У вас нет прав на создание проекта'
            });
        }

        const doc = new ProjectModel({
            name: req.body.name,
            description: req.body.description,
            initiator: req.userId,
        });

        const project = await doc.save();

        // добавление проекта в список организации
        OrganizationModel.findOneAndUpdate(
            { _id: organization._doc._id }, 
            { $push: { projects: project } }
        ).exec();

        return res.json({
            message: 'Создан новый проект'
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось создать проект'
        });
    }
}

export const getProjects = async (req, res) => {
    // поиск организации
    const organization = await OrganizationModel.findById(req.body.organizationId).populate({
        path: 'projects',
        select: 'name description'
    });;
    if (!organization) {
        return res.status(404).json({
            message: 'Организация не найдена'
        });
    };

    // получение списка проектов
    const projects = organization.projects;
    return res.json(projects);
}

export const addUser = async (req, res) => {
    try {
        // поиск добавляемого пользователя
        const newMember = await UserModel.findById(req.body.newMemberId);
        if (!newMember) {
            return res.status(404).json({
                message: 'Пользователь не найден'
            });
        }

        // поиск организации
        const organization = await OrganizationModel.findById(req.body.organizationId);
        if (!organization) {
            return res.status(404).json({
                message: 'Организация не найдена'
            });
        }

        // добавление организации в список пользователя
        UserModel.findOneAndUpdate(
            { _id: newMember._doc._id }, 
            { $push: { organizations: organization } }
        ).exec();

        return res.json({
            message: 'Добавлен участник в организацию'
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось добавить участника в организацию'
        });
    }
}

export const allUsers = async (req, res) => {
    try {
        // поиск организации
        const organization = await OrganizationModel.findById(req.body.organizationId);
        if (!organization) {
            return res.status(404).json({
                message: 'Организация не найдена'
            });
        }

        // поиск всех пользователей
        const users = await UserModel.find({ organizations: { $ne: organization } }).select('_id surname name otch');

        return res.json(users);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить список пользователей'
        });
    }
}

export const getMembers = async (req, res) => {
    try {
        // поиск организации
        const organization = await OrganizationModel.findById(req.body.organizationId);
        if (!organization) {
            return res.status(404).json({
                message: 'Организация не найдена'
            });
        };

        // поиск участников организации
        const users = await UserModel.find({ organizations: organization }).select('_id surname name otch');

        return res.json(users);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить список участников'
        });
    }
}