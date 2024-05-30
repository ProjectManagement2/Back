import PermissionModel from '../models/Permission.js';
import ProjectModel from '../models/Project.js';


export default async (req, res, next) => {
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
        return res.status(404).json({
            message: 'У вас нет прав доступа лидера проекта'
        });
    }

    next();
}