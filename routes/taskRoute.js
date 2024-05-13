import { Router } from "express";
import multer from "multer";

import * as TaskController from '../controllers/TaskController.js';
import checkAuth from '../utils/checkAuth.js';

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
router.patch('/updateSolution', checkAuth, upload.array('files'), TaskController.updateSolution);



export default router;
