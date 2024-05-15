import { Router } from "express";

import * as UserController from '../controllers/UserController.js';
import checkAuth from '../utils/checkAuth.js';

const router = new Router();

// получение данных о пользователе
// /api/profile/info
router.get('/info', checkAuth, UserController.userInfo);

// получение данных об организациях, где состоит пользователь
// /api/profile/organizations
router.get('/organizations', checkAuth, UserController.userOrganizations);

// обновление данных пользователя
// /api/profile/updateUserInfo
router.patch('/updateUserInfo', checkAuth, UserController.updateUserInfo);

// вывод задач пользователя для канбан доски
// /api/profile/userTasks
router.get('/userTasks', checkAuth, UserController.userTasks);

export default router;