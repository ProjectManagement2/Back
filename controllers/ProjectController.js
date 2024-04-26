import ProjectModel from '../models/Project.js'
import PermissionModel from '../models/Permission.js';
import OrganizationModel from '../models/Organization.js';
import UserModel from '../models/User.js';

export const mainInfo = async (req, res) => {
    try {
        // поиск проекта
        const project = await ProjectModel.findById(req.headers.projectid).select('name description initiator')
        .populate({
            path: 'initiator',
            select: 'surname name otch',
        });

        if (!project) {
            return res.status(404).json({
                message: 'Проект не найден'
            });
        }
        
        return res.json(project);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить информацию о проекте'
        });
    }
}