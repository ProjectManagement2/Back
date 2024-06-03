import TaskModel from '../models/Task.js';
import SolutionModel from '../models/Solution.js';
import ChatModel from '../models/Chat.js';
import MessageModel from '../models/Message.js';
import CommentModel from '../models/Comment.js';

export const taskInfo = async (req, res) => {
    try {
        // поиск задачи
        const task = await TaskModel.findById(req.headers.taskid)
        .select('name description deadline createdDate status isImportant tags worker files solution')
        .populate({
            path: 'worker',
            select: 'surname name otch'
        });

        if (!task) {
            return res.status(404).json({
                message: 'Задача не найдена'
            });
        }

        // получение информации о файлах, прикрепленных к задаче
        const taskFiles = task.files.map(file => ({
            path: `uploads/${file}`,
            filename: file,
        }));

        // получение информации о файлах, прикрепленных к решению
        const solutionFiles = task.solution.files.map(file => ({
            path: `uploads/${file}`,
            filename: file,
        }));

        const taskInfo = {
            ...task.toObject(),
            files: taskFiles,
            solution: {
                text: task.solution.text,
                files: solutionFiles
            }
        };

        return res.json(taskInfo);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить информацию о задаче'
        });
    }
}

export const changeStatus = async (req, res) => {
    try {
        // поиск задачи
        const task = await TaskModel.findById(req.headers.taskid);

        if (!task) {
            return res.status(404).json({
                message: 'Задача не найдена'
            });
        }

        // проверка права на обновление статуса задачи
        if (task._doc.worker != req.userId) {
            return res.status(404).json({
                message: 'Вы не можете обновить статус задачи'
            });
        }

        // обновление статуса задачи
        const updatedTask = await TaskModel.findByIdAndUpdate(
            {_id: task._doc._id},
            {
                status: req.body.status
            }
        );

        res.json({
            message: 'Статус задачи изменен'
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось изменить статус'
        });
    }
}

export const updateSolution = async (req, res) => {
    try {
        // поиск задачи
        const task = await TaskModel.findById(req.headers.taskid);

        if (!task) {
            return res.status(404).json({
                message: 'Задача не найдена'
            });
        }

        // проверка права на добавление решения
        if (task._doc.worker != req.userId) {
            return res.status(404).json({
                message: 'Вы не можете добавить решение к задаче'
            });
        }

        // проверка наличия файлов и сохранение их имен или путей
        let filesArray = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                filesArray.push(file.filename); // имя файла или путь к файлу
            });
        }

        // обновление решения
        const updatedTask = await TaskModel.findByIdAndUpdate(
            {_id: task._doc._id},
            {
                solution: {
                    text: req.body.text,
                    files: filesArray // сохраняем имена или пути к файлам
                }
            }
        );

        // создание уведомления в чат проекта
        // поиск чата
        const chat = await ChatModel.findOne({project: task._doc.project});
        if (!chat) {
            return res.status(404).json({
                message: 'Чат не найден'
            });
        }

        // создание сообщения
        const doc = new MessageModel({
            text: 'Обновлен отчет по задаче: ' + task._doc.name,
            author: req.userId,
        });
        const message = await doc.save();

        // добавление нового сообщения в чат проекта
        ChatModel.findOneAndUpdate(
            { _id: chat._doc._id },
            { $push: { messages: message }}
        ).exec();

        res.json({
            message: "Обновлено решение задачи"
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось добавить решение задачи'
        });
    }
}

export const createComment = async (req, res) => {
    try {
        // поиск задачи
        const task = await TaskModel.findById(req.headers.taskid);
        if (!task) {
            return res.status(404).json({
                message: 'Задача не найдена'
            });
        }

        // изменение статуса задачи
        const updatedTask = await TaskModel.findByIdAndUpdate(
            {_id: task._doc._id},
            {
                status: req.body.status
            }
        );

        // изменение статуса всех задач, которые зависят от этой задачи, на "Новая"
        if (req.body.status === "Утверждена") {
            await TaskModel.updateMany(
                { relatedTask: updatedTask._id },
                { status: "Новая" }
            ).exec();
        } else if (req.body.status !== "Утверждена") {
            await TaskModel.updateMany(
                { relatedTask: updatedTask._id },
                { status: "Недоступна" }
            ).exec();
        }

        // создание комментария, если он есть
        if (req.body.text) {
            const doc = new CommentModel({
                task: task._doc._id,
                text: req.body.text
            });
            const comment = await doc.save();
        }
        
        res.json({
            message: "Добавлен комментарий к задаче и/или изменен статус"
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось добавить комментарий к задаче'
        });
    }
}

export const getComments = async (req, res) => {
    try {
        // поиск задачи
        const task = await TaskModel.findById(req.headers.taskid);
        if (!task) {
            return res.status(404).json({
                message: 'Задача не найдена'
            });
        }

        // поиск комментариев
        const comments = await CommentModel.find({ task: task._doc._id }).select('text');

        res.json(comments);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить все комментарии'
        });
    }
}