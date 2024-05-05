import { Router } from "express";

import * as ProjectController from '../controllers/ProjectController.js';

import checkAuth from '../utils/checkAuth.js';
import checkProjLeader from "../utils/checkProjLeader.js";

const router = new Router();

// получение основных данных о проекте
// /api/project/mainInfo
router.get('/mainInfo', checkAuth, ProjectController.mainInfo);

// ------------------------------------- РУКОВОДИТЕЛИ ПРОЕКТА -----------------------------------------

// получение списка руководителей проекта
// /api/project/getProjectLeaders
router.get('/getProjectLeaders', checkAuth, ProjectController.getProjectLeaders);

// добавление руководителей проекта
// /api/project/createProjectLeader
// router.post('/createProjectLeader', checkAuth, ProjectController.createProjectLeader);

// -------------------------------------------- СООБЩЕНИЯ ------------------------------------------------

// добавление сообщения
// /api/project/addMessage
router.post('/addMessage', checkAuth, ProjectController.addMessage);

// вывод всех сообщений
// /api/project/getMessages
router.get('/getMessages', checkAuth, ProjectController.getMessages);

// удаление всех сообщений
// /api/project/deleteMessages
router.delete('/deleteMessages', checkAuth, checkProjLeader, ProjectController.deleteMessages);

// ----------------------------------------------- ЭТАПЫ --------------------------------------------------

// создание этапа
// /api/project/createStage
router.post('/createStage', checkAuth, checkProjLeader, ProjectController.createStage);

// получение списка этапов
// /api/project/getAllStages
router.get('/getAllStages', checkAuth, ProjectController.getAllStages);

// ----------------------------------------------- ЗАДАЧИ ---------------------------------------------------

// создание задачи
// /api/project/createTask
router.post('/createTask', checkAuth, checkProjLeader, ProjectController.createTask);

// вывод списка задач для одного этапа
// /api/project/getAllTasks
router.get('/getAllTasks', checkAuth, ProjectController.getAllTasks);

export default router;