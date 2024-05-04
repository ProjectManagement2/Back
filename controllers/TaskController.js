import TaskModel from '../models/Task.js';

export const taskInfo = async (req, res) => {
    try {
        // поиск задачи
        const task = await TaskModel.findById(req.headers.taskid).select('name description deadline status isImportant tags worker')
        .populate({
            path: 'worker',
            select: 'surname name otch'
        });
        console.log(task);

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