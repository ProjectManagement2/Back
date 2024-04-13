import ProjectModel from '../models/Project.js'
import PermissionModel from '../models/Permission.js';
import OrganizationModel from '../models/Organization.js';

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

        // добавить в организацию проект !!!

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