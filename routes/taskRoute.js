import { Router } from "express";

import * as TaskController from '../controllers/TaskController.js';
import checkAuth from '../utils/checkAuth.js';

const router = new Router();

// --------------------------------------------- ЗАДАЧИ -----------------------------------------------

// получение информации о задаче
// /api/task/taskInfo
router.get('/taskInfo', checkAuth, TaskController.taskInfo);

// изменение статуса задачи
// /api/task/changeStatus
router.patch('/changeStatus', checkAuth, TaskController.changeStatus);

// --------------------------------------------- РЕШЕНИЯ -----------------------------------------------

// добавление решения задачи
// /api/task/createSolution
router.post('/createSolution', checkAuth, TaskController.createSolution);

// вывод всех решений задачи
// /api/task/getAllSolutions
router.get('/getAllSolutions', checkAuth, TaskController.getAllSolutions);

export default router;
