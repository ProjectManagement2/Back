import { Router } from "express";

import * as ProjectController from '../controllers/ProjectController.js';
import checkAuth from '../utils/checkAuth.js';

const router = new Router();

// получение основных данных о проекте
// /api/project/mainInfo
router.get('/mainInfo', checkAuth, ProjectController.mainInfo);

export default router;