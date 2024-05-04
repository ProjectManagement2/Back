import { Router } from "express";

import * as TaskController from '../controllers/TaskController.js';
import checkAuth from '../utils/checkAuth.js';

const router = new Router();


// получение информации о задаче
// /api/task/taskInfo
router.get('/taskInfo', checkAuth, TaskController.taskInfo);



export default router;
