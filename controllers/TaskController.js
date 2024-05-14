import TaskModel from '../models/Task.js';
import SolutionModel from '../models/Solution.js';

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

        // проверка права на добавление задачи
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
                    files: filesArray // Сохраняем имена или пути к файлам
                }
            }
        );

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