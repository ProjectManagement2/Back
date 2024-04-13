import { Router } from "express";

import * as AdminController from '../controllers/AdminController.js';
import checkAuth from '../utils/checkAuth.js';

const router = new Router();

// авторизация админа
// /api/admin/auth
router.post('/auth', AdminController.login);

// создание организации
// /api/admin/createOrganization
router.post('/createOrganization', checkAuth, AdminController.createOrganization);

// получение списка всех организаций
// /api/admin/getOrganizations
router.get('/getOrganizations', checkAuth, AdminController.getAllOrganizations);

// получение списка всех пользователей
// /api/admin/getUsers
router.get('/getUsers', checkAuth, AdminController.getAllUsers);

export default router;