import { Router } from "express";
import multer from "multer";

import * as ProjectController from '../controllers/ProjectController.js';

import checkAuth from '../utils/checkAuth.js';
import checkProjLeader from "../utils/checkProjLeader.js";


// настройка multer для сохранения файлов в определенную директорию
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // путь к директории, куда будут сохраняться файлы
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // уникальное имя файла (текущее время + оригинальное имя файла)
    }
});
const upload = multer({ storage: storage });


const router = new Router();

// получение основных данных о проекте
// /api/project/mainInfo
router.get('/mainInfo', checkAuth, ProjectController.mainInfo);

// получение списка людей, работающих над проектом
// /api/project/getProjectMembers
router.get('/getProjectMembers', checkAuth, ProjectController.getProjectMembers);

// ------------------------------------- РУКОВОДИТЕЛИ ПРОЕКТА -----------------------------------------

// получение списка руководителей проекта
// /api/project/getProjectLeaders
router.get('/getProjectLeaders', checkAuth, ProjectController.getProjectLeaders);

// получение списка участников, которых можно сделать руководителями проекта
// /api/project/membersForLeader
router.get('/membersForLeader', checkAuth, ProjectController.membersForLeader);

// добавление руководителей проекта
// /api/project/addProjectLeader
router.patch('/addProjectLeader', checkAuth, checkProjLeader, ProjectController.addProjectLeader);

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

// редактирование этапа
// /api/project/updateStage
router.patch('/updateStage', checkAuth, checkProjLeader, ProjectController.updateStage);

// сдвиг этапа
// /api/project/moveStage
router.patch('/moveStage', checkAuth, checkProjLeader, ProjectController.moveStage);

// изменение статуса isDone
// /api/project/updateStageStatus
// router.patch('/updateStageStatus', checkAuth, checkProjLeader, ProjectController.updateStageStatus);

// удаление этапа
// /api/project/deleteStage
router.delete('/deleteStage', checkAuth, checkProjLeader, ProjectController.deleteStage);

// ----------------------------------------------- ЗАДАЧИ ---------------------------------------------------

// создание задачи
// /api/project/createTask
router.post('/createTask', checkAuth, checkProjLeader, upload.array('files'), ProjectController.createTask);

// удаление задачи
// /api/project/deleteTask
router.delete('/deleteTask', checkAuth, checkProjLeader, ProjectController.deleteTask);

// редактирование задачи
// /api/project/updateTask
router.patch('/updateTask', checkAuth, checkProjLeader, ProjectController.updateTask);

// вывод списка задач для одного этапа
// /api/project/getAllTasks
router.get('/getAllTasks', checkAuth, ProjectController.getAllTasks);

// вывод задач для календаря
// /api/project/getCalendarTasks
router.get('/getCalendarTasks', checkAuth, ProjectController.getCalendarTasks);

// ----------------------------------------------- СТАТИСТИКА ---------------------------------------------------

// вывод статистики по проекту
// /api/project/statistics
router.get('/statistics', checkAuth, ProjectController.statistics);

export default router;