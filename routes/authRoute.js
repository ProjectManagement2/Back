import { Router } from "express";

import {registerValidation} from '../validations/auth.js';
import * as UserController from '../controllers/UserController.js';

const router = new Router();

// регистрация
// /api/auth/register
router.post('/register', registerValidation, UserController.register);

// авторизация
// /api/auth/login
router.post('/login', UserController.login);

export default router;