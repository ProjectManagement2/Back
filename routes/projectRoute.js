import { Router } from "express";

import * as ProjectController from '../controllers/ProjectController.js';
import checkAuth from '../utils/checkAuth.js';

const router = new Router();

// создание проекта
// /api/project/createProject
router.post('/createProject', checkAuth, ProjectController.createProject);

export default router;