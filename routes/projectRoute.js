import { Router } from "express";

import * as ProjectController from '../controllers/ProjectController.js';
import checkAuth from '../utils/checkAuth.js';

const router = new Router();

// получение основных данных о проекте
// /api/project/mainInfo
router.get('/mainInfo', checkAuth, ProjectController.mainInfo);

// получение списка руководителей проекта
// /api/project/getProjectLeaders
router.get('/getProjectLeaders', checkAuth, ProjectController.getProjectLeaders);

// добавление руководителей проекта
// /api/project/createProjectLeader
// router.post('/createProjectLeader', checkAuth, ProjectController.createProjectLeader);

// добавление сообщения
// /api/project/addMessage
router.post('/addMessage', checkAuth, ProjectController.addMessage);

// вывод всех сообщений
// /api/project/getMessages
router.get('/getMessages', checkAuth, ProjectController.getMessages);

export default router;