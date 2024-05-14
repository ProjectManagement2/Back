import UserModel from '../models/User.js';
import OrganizationModel from '../models/Organization.js';
import PermissionModel from '../models/Permission.js';
import ProjectModel from '../models/Project.js';
import TaskModel from '../models/Task.js';


export const checkOrgLeader = async (req, res) => {
    try {
        // поиск организации
        const organization = await OrganizationModel.findById(req.headers.organizationid);
        if (!organization) {
            return res.status(404).json({
                message: 'Организация не найдена'
            });
        }

        // проверка прав доступа
        const permission = await PermissionModel.findOne({user: req.userId, organization: organization._doc._id, role: 'OrganizationLeader'});
        if (!permission) {
            return res.json({
                access: false
            });
        }
        else {
            return res.json({
                access: true
            });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось проверить лидера организации'
        });
    }
}

export const checkProjectLeader = async (req, res) => {
    try {
        // поиск проекта
        const project = await ProjectModel.findById(req.headers.projectid);
        if (!project) {
            return res.status(404).json({
                message: 'Проект не найден'
            });
        }

        // проверка прав доступа
        const permission = await PermissionModel.findOne({user: req.userId, project: project._doc._id, role: 'ProjectLeader'});
        if (!permission) {
            return res.json({
                access: false
            });
        }
        else {
            return res.json({
                access: true
            });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось проверить лидера проекта'
        });
    }
}

export const checkTaskWorker = async (req, res) => {
    try {
        // поиск задачи
        const task = await TaskModel.findById(req.headers.taskid);
        if (!task) {
            return res.status(404).json({
                message: 'Задача не найдена'
            });
        }

        // проверка прав доступа
        if (task._doc.worker != req.userId) {
            return res.json({
                access: false
            });
        }
        else {
            return res.json({
                access: true
            });
        }

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось проверить исполнителя задачи'
        });
    }
}