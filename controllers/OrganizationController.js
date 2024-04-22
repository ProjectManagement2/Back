import ProjectModel from '../models/Project.js'
import PermissionModel from '../models/Permission.js';
import OrganizationModel from '../models/Organization.js';


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