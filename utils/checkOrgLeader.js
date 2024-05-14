import PermissionModel from '../models/Permission.js';
import OrganizationModel from '../models/Organization.js';


export default async (req, res, next) => {

    // поиск организации, в которой состоит пользователь
    const organization = await OrganizationModel.findById(req.headers.organizationid);
    if (!organization) {
        return res.status(404).json({
            message: 'Организация не найдена'
        });
    }

    // просмотр разрешения
    const permission = await PermissionModel.findOne({user: req.userId, organization: organization._doc._id, role: 'OrganizationLeader'});
    if (!permission) {
        return res.status(404).json({
            message: 'У вас нет прав доступа лидера организации'
        });
    }

    next();
}