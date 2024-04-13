import { Router } from "express";

import * as UserController from '../controllers/UserController.js';
import checkAuth from '../utils/checkAuth.js';

const router = new Router();

// получение данных о пользователе
// /api/profile/info
router.get('/info', checkAuth, UserController.userInfo);

export default router;