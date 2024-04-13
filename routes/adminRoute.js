import { Router } from "express";

import * as AdminController from '../controllers/AdminController.js';
import checkAuth from '../utils/checkAuth.js';

const router = new Router();

// авторизация админа
// /api/admin/auth
router.post('/auth', AdminController.login);

// создание организации
// /api/admin/profile
router.post('/profile', checkAuth, AdminController.createOrganization);

// получение списка всех организаций
// /api/admin/profile
router.get('/profile', checkAuth, AdminController.getAllOrganizations);

export default router;