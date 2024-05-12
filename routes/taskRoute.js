import { Router } from "express";

import * as TaskController from '../controllers/TaskController.js';
import checkAuth from '../utils/checkAuth.js';

const router = new Router();

// --------------------------------------------- ЗАДАЧИ -----------------------------------------------

// получение информации о задаче и решении
// /api/task/taskInfo
router.get('/taskInfo', checkAuth, TaskController.taskInfo);

// изменение статуса задачи
// /api/task/changeStatus
router.patch('/changeStatus', checkAuth, TaskController.changeStatus);

// --------------------------------------------- РЕШЕНИЯ -----------------------------------------------

// обновление решения задачи
// /api/task/createSolution
router.patch('/updateSolution', checkAuth, TaskController.updateSolution);



export default router;
