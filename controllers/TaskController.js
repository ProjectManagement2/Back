import TaskModel from '../models/Task.js';

export const taskInfo = async (req, res) => {
    try {
        // поиск задачи
        const task = await TaskModel.findById(req.headers.taskid).select('name description deadline createdDate status isImportant tags worker')
        .populate({
            path: 'worker',
            select: 'surname name otch'
        });

        if (!task) {
            return res.status(404).json({
                message: 'Задача не найдена'
            });
        }

        return res.json(task);
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