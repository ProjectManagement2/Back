import { Router } from "express";

import * as OrganizationController from '../controllers/OrganizationController.js';
import checkAuth from '../utils/checkAuth.js';

const router = new Router();

// вывод основной информации об организации
//  /api/organization/mainInfo
router.get('/mainInfo', checkAuth, OrganizationController.mainInfo);

// создание проекта
// /api/organization/createProject
router.post('/createProject', checkAuth, OrganizationController.createProject);

export default router;