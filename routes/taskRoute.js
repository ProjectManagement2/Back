import { Router } from "express";

import * as TaskController from '../controllers/TaskController.js';
import checkAuth from '../utils/checkAuth.js';

const router = new Router();


// получение информации о задаче
// /api/task/taskInfo
router.get('/taskInfo', checkAuth, TaskController.taskInfo);

// изменение статуса задачи
// /api/task/changeStatus
router.patch('/changeStatus', checkAuth, TaskController.changeStatus);

export default router;
