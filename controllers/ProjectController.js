import ProjectModel from '../models/Project.js'
import PermissionModel from '../models/Permission.js';
import OrganizationModel from '../models/Organization.js';
import UserModel from '../models/User.js';
import MessageModel from '../models/Message.js';
import StageModel from '../models/Stage.js';
import TaskModel from '../models/Task.js';
import ChatModel from '../models/Chat.js';


export const mainInfo = async (req, res) => {
    try {
        // поиск проекта с задачами
        const project = await ProjectModel.findById(req.headers.projectid)
        .select('stages')
        .populate({
            path: 'stages',
            populate: {
                path: 'tasks',
                select: 'status',
            },
        });
    
        if (!project) {
            return res.status(404).json({
                message: 'Проект не найден'
            });
        }
    
        // сбор статистики по задачам
        const taskStatusCount = {
            statusNew: 0,
            statusInProcess: 0,
            statusDone: 0,
        };
    
        project.stages.forEach(stage => {
            stage.tasks.forEach(task => {
                if (task.status === 'Новая') {
                    taskStatusCount.statusNew++;
                } else if (task.status === 'Выполняется') {
                    taskStatusCount.statusInProcess++;
                } else if (task.status === 'Завершена') {
                    taskStatusCount.statusDone++;
                }
            });
        });

        // поиск основной информации о проекте
        const projectMainInfo = await ProjectModel.findById(req.headers.projectid)
        .select('name description initiator')
        .populate({
            path: 'initiator',
            select: 'surname name otch',
        })
    
        const response = {
            ...projectMainInfo.toObject(),
            taskStatusCount,
        };
    
        return res.json(response);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить информацию о проекте'
        });
    }
}

export const getProjectLeaders = async (req, res) => {
    try {
        // поиск проекта
        const project = await ProjectModel.findById(req.headers.projectid).select('projectLeaders')
        .populate({
            path: 'projectLeaders',
            select: 'surname name otch email',
        });

        if (!project) {
            return res.status(404).json({
                message: 'Проект не найден'
            });
        }

        return res.json(project.projectLeaders);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить информацию о руководителях проекта'
        });
    }
}

export const membersForLeader = async (req, res) => {
    try {
        // поиск проекта
        const project = await ProjectModel.findById(req.headers.projectid);
        if (!project) {
            return res.status(404).json({
                message: 'Проект не найден'
            });
        }

        // поиск организации
        const organization = await OrganizationModel.findById(req.headers.organizationid);
        if (!organization) {
            return res.status(404).json({
                message: 'Организация не найдена'
            });
        };

        // поиск участников организации, которых можно назначить руководителями проекта
        const users = await UserModel.find({ organizations: organization, _id: {$nin: project.projectLeaders} })
        .select('_id surname name otch');

        return res.json(users);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить список участников'
        });
    }
}

export const addProjectLeader = async (req, res) => {
    try {
        // поиск проекта
        const project = await ProjectModel.findById(req.headers.projectid);

        if (!project) {
            return res.status(404).json({
                message: 'Проект не найден'
            });
        }

        // поиск пользователя
        const projectLeader = await UserModel.findById(req.body.newLeaderId);
        if (!projectLeader) {
            return res.status(404).json({
                message: 'Пользователь не найден'
            });
        }

        // добавление нового лидера проекта
        ProjectModel.findOneAndUpdate(
            { _id: project._doc._id },
            { $push: { projectLeaders: projectLeader }}
        ).exec();

        // добавление права доступа лидеру проекта
        const doc_permisson = new PermissionModel({
            project: project._doc._id,
            role: 'ProjectLeader',
            user: projectLeader._doc._id,
        });
        const new_permission = await doc_permisson.save();

        return res.json({
            message: 'Добавлен новый лидер'
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось добавить руководителя проекта'
        });
    }
}

export const addMessage = async (req, res) => {
    try {
        // поиск чата
        const chat = await ChatModel.findOne({project: req.headers.projectid});
        if (!chat) {
            return res.status(404).json({
                message: 'Чат не найден'
            });
        }

        // создание сообщения
        const doc = new MessageModel({
            text: req.body.text,
            author: req.userId,
        });
        const message = await doc.save();

        // добавление нового сообщения в чат проекта
        ChatModel.findOneAndUpdate(
            { _id: chat._doc._id },
            { $push: { messages: message }}
        ).exec();

        res.json({
            message: "Создано сообщение"
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось добавить сообщение'
        });
    }
}

export const getMessages = async (req, res) => {
    try {
        // поиск чата
        const chat = await ChatModel.findOne({project: req.headers.projectid}).select('messages')
        .populate({
            path: 'messages',
            select: 'text author timestamp',
            populate: {
                path: 'author',
                select: 'surname name otch'
            }
        });
        if (!chat) {
            return res.status(404).json({
                message: 'Чат не найден'
            });
        }

        return res.json(chat.messages);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить сообщения'
        });
    }
}

export const deleteMessages = async (req, res) => {
    try {
        // поиск чата
        const chat = await ChatModel.findOne({project: req.headers.projectid});
        if (!chat) {
            return res.status(404).json({
                message: 'Чат не найден'
            });
        }

        // удаление всех сообщений, связанных с данным чатом
        await MessageModel.deleteMany({ _id: { $in: chat.messages } });

        // удаление удаленных сообщений из списка чата
        chat.messages = [];
        await chat.save();

        res.status(200).json({
            message: 'Все сообщения удалены успешно'
        });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось удалить сообщения'
        });
    }
}

export const createStage = async (req, res) => {
    try {
        // поиск проекта
        const project = await ProjectModel.findById(req.headers.projectid);
        if (!project) {
            return res.status(404).json({
                message: 'Проект не найден'
            });
        }

        // проверка даты: дата начала < дата конца
        const { startDate, endDate } = req.body;
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                message: 'Дата начала должна быть меньше даты дедлайна'
            });
        }

        let isAvailable = true;
        
        if (req.body.relatedStage == '') {
            req.body.relatedStage = null;
        }
        // проверка связанного этапа
        if (req.body.relatedStage) {
            const relatedStageDoc = await StageModel.findById(req.body.relatedStage);
            if (!relatedStageDoc) {
                return res.status(404).json({
                    message: 'Связанный этап не найден'
                });
            }
            isAvailable = relatedStageDoc.isDone;
        }

        // создание этапа
        const doc = new StageModel({
            name: req.body.name,
            description: req.body.description,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            isAvailable: isAvailable,
            relatedStage: req.body.relatedStage
        });
        const stage = await doc.save();

        // добавление нового этапа в проект
        ProjectModel.findOneAndUpdate(
            { _id: project._doc._id },
            { $push: { stages: stage }}
        ).exec();

        res.json({
            message: "Создан этап"
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось создать этап'
        });
    }
}

export const getAllStages = async (req, res) => {
    try {
        // поиск проекта
        const project = await ProjectModel.findById(req.headers.projectid).select('stages')
        .populate({
            path: 'stages',
            select: 'name description isDone isAvailable startDate endDate',
        });

        if (!project) {
            return res.status(404).json({
                message: 'Проект не найден'
            });
        }

        return res.json(project.stages);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить список этапов'
        });
    }
}

export const updateStage = async (req, res) => {
    try {
        // поиск этапа
        const stage = await StageModel.findById(req.headers.stageid);
        if (!stage) {
            return res.status(404).json({
                message: 'Этап не найден'
            });
        }

        // проверка даты: дата начала < дата конца
        const { startDate, endDate } = req.body;
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                message: 'Дата начала должна быть меньше даты дедлайна'
            });
        }

        // редактирование этапа
        const updatedTask = await StageModel.findByIdAndUpdate(
            {_id: stage._doc._id},
            {
                name: req.body.name,
                description: req.body.description,
                startDate: req.body.startDate,
                endDate: req.body.endDate
            }
        );

        // получение задач, связанных с этапом
        const tasks = await TaskModel.find({ _id: { $in: stage.tasks } });

        // обновление дат задач, которые выходят за пределы новых дат этапа
        const updatedTasksPromises = tasks.map(task => {
            const taskStartDate = new Date(task.startDate);
            const taskDeadline = new Date(task.deadline);
            const newStartDate = new Date(req.body.startDate);
            const newEndDate = new Date(req.body.endDate);

            let updateFields = {};
            if (taskStartDate < newStartDate) {
                updateFields.startDate = newStartDate;
            }
            if (taskDeadline > newEndDate) {
                updateFields.deadline = newEndDate;
            }

            // если есть поля для обновления, выполняем запрос
            if (Object.keys(updateFields).length > 0) {
                return TaskModel.findByIdAndUpdate(
                    { _id: task._id },
                    updateFields,
                    { new: true }
                );
            }
        });

        await Promise.all(updatedTasksPromises);

        res.json({
            "message": "Этап обновлен"
        });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось редактировать этап'
        });
    }
}

export const moveStage = async (req, res) => {
    try {
        // поиск этапа
        const stage = await StageModel.findById(req.headers.stageid);
        if (!stage) {
            return res.status(404).json({
                message: 'Этап не найден'
            });
        }

        const { days } = req.body;

        if (!days || isNaN(days)) {
            return res.status(400).json({ message: 'Количество дней должно быть числом' });
        }

        // функция для сдвига даты
        const shiftDates = (date, days) => {
            const result = new Date(date);
            result.setDate(result.getDate() + parseInt(days));
            return result;
        };

        // сдвиг дат этапа
        stage.startDate = shiftDates(stage.startDate, days);
        stage.endDate = shiftDates(stage.endDate, days);

        await stage.save();

        // сдвиг дат всех задач, связанных с этим этапом
        const tasks = await TaskModel.find({ _id: { $in: stage.tasks } });

        for (let task of tasks) {
            task.startDate = shiftDates(task.startDate, days);
            task.deadline = shiftDates(task.deadline, days);
            await task.save();
        }

        res.json({
            message: 'Даты успешно сдвинуты'
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось сдвинуть этап'
        });
    }
}

export const updateStageStatus = async (req, res) => {
    try {
        // поиск этапа
        const stage = await StageModel.findById(req.headers.stageid);
        if (!stage) {
            return res.status(404).json({
                message: 'Этап не найден'
            });
        }

        // изменение статуса этапа
        const updatedStage = await StageModel.findByIdAndUpdate(
            {_id: stage._doc._id},
            {
                isDone: req.body.isDone
            }
        );

        // Найти этапы, зависящие от текущего этапа
        const dependentStages = await StageModel.find({ relatedStage: stage._id });

        if (req.body.isDone) {
            // обновить статус доступности зависимых этапов и их задач, если текущий этап завершен
            for (const dependentStage of dependentStages) {
                await StageModel.findByIdAndUpdate(
                    dependentStage._id,
                    { isAvailable: true }
                );

                // обновить статус задач в зависимом этапе
                await TaskModel.updateMany(
                    { _id: { $in: dependentStage.tasks } },
                    { status: "Новая" }
                );
            }
        } else {
            // Обновить статус доступности зависимых этапов и их задач, если текущий этап не завершен
            for (const dependentStage of dependentStages) {
                await StageModel.findByIdAndUpdate(
                    dependentStage._id,
                    { isAvailable: false }
                );

                // обновить статус задач в зависимом этапе
                await TaskModel.updateMany(
                    { _id: { $in: dependentStage.tasks } },
                    { status: "Недоступна" }
                );
            }
        }

        res.json({
            message: 'Статус этапа обновлён'
        });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось обновить статус этапа'
        });
    }
}

export const createTask = async (req, res) => {
    try {
        // поиск этапа
        const stage = await StageModel.findById(req.headers.stageid);
        if (!stage) {
            return res.status(404).json({
                message: 'Этап не найден'
            });
        }
        // поиск проекта
        const project = await ProjectModel.findById(req.headers.projectid);
        if (!project) {
            return res.status(404).json({
                message: 'Проект не найден'
            });
        }
        
        // проверка наличия файлов и сохранение их имен или путей
        let filesArray = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                filesArray.push(file.filename); // имя файла или путь к файлу
            });
        }

        // проверка даты: дата начала < дата конца
        const { startDate, deadline } = req.body;
        if (new Date(startDate) >= new Date(deadline)) {
            return res.status(400).json({
                message: 'Дата начала должна быть меньше даты дедлайна'
            });
        }

        // проверка, что даты задач не выходят за пределы дат этапа
        if (new Date(startDate) < new Date(stage.startDate) || new Date(deadline) > new Date(stage.endDate)) {
            return res.status(400).json({
                message: 'Даты задачи должны быть в пределах дат этапа'
            });
        }

        let status = "Новая"
        if (!stage._doc.isAvailable) {
            status = "Недоступна"
        }

        // создание задачи
        const doc = new TaskModel({
            name: req.body.name,
            description: req.body.description,
            startDate: req.body.startDate,
            deadline: req.body.deadline,
            status: status,
            isImportant: req.body.isImportant,
            tags: req.body.tags,
            worker: req.body.worker,
            project: project._doc._id,
            files: filesArray // Сохраняем имена или пути к файлам
        });
        const task = await doc.save();

        // добавление задачи в список этапа
        StageModel.findOneAndUpdate(
            { _id: stage._doc._id },
            { $push: { tasks: task }}
        ).exec();

        // добавление задачи в список исполнителя
        UserModel.findOneAndUpdate(
            { _id: req.body.worker },
            { $push: { tasks: task }}
        ).exec();

        res.json({
            message: "Создана задача"
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось создать задачу'
        });
    }
}

export const deleteTask = async (req, res) => {
    try {
        // поиск задачи
        const task = await TaskModel.findById(req.headers.taskid);

        if (!task) {
            return res.status(404).json({
                message: 'Задача не найдена'
            });
        }

        // этап, к которому принадлежит удаляемая задача
        const stage = await StageModel.findOne({ tasks: req.headers.taskid });
        if (!stage) {
            return res.status(404).json({
                message: 'Этап не найден'
            });
        }
        // удалить ID задачи из массива задач этапа
        stage.tasks.pull(req.headers.taskid);
        await stage.save();

        // исполнитель, который выполняет задачу
        const worker = await UserModel.findById(task._doc.worker);
        if (!worker) {
            return res.status(404).json({
                message: 'Исполнитель не найден'
            });
        }
        // удалить ID задачи из массива задач исполнителя
        worker.tasks.pull(req.headers.taskid);
        await worker.save();

        // удаление самой задачи
        await TaskModel.deleteOne({ _id: task._doc._id });

        res.json({
            message: "Задача удалена"
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось удалить задачу'
        });
    }
}

export const updateTask = async (req, res) => {
    try {
        // поиск задачи
        const task = await TaskModel.findById(req.headers.taskid);

        if (!task) {
            return res.status(404).json({
                message: 'Задача не найдена'
            });
        }

        // поиск этапа
        const stage = await StageModel.findById(req.headers.stageid);
        if (!stage) {
            return res.status(404).json({
                message: 'Этап не найден'
            });
        }

        // проверка даты: дата начала < дата конца
        const { startDate, deadline } = req.body;
        if (new Date(startDate) >= new Date(deadline)) {
            return res.status(400).json({
                message: 'Дата начала должна быть меньше даты дедлайна'
            });
        }

        // проверка, что даты задач не выходят за пределы дат этапа
        if (new Date(startDate) < new Date(stage.startDate) || new Date(deadline) > new Date(stage.endDate)) {
            return res.status(400).json({
                message: 'Даты задачи должны быть в пределах дат этапа'
            });
        }

        // редактирование задачи
        const updatedTask = await TaskModel.findByIdAndUpdate(
            {_id: task._doc._id},
            {
                name: req.body.name,
                description: req.body.description,
                startDate: req.body.startDate,
                deadline: req.body.deadline
            }
        );
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось редактировать задачу'
        });
    }
}

export const getAllTasks = async (req, res) => {
    try {
        // поиск этапа
        const stage = await StageModel.findById(req.headers.stageid).select('tasks')
        .populate({
            path: 'tasks',
            select: 'name status',
        });

        if (!stage) {
            return res.status(404).json({
                message: 'Этап не найден'
            });
        }

        return res.json(stage.tasks);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить список задач'
        });
    }
}

export const getCalendarTasks = async (req, res) => {
    try {
        // поиск проекта
        const project = await ProjectModel.findById(req.headers.projectid);
        if (!project) {
            return res.status(404).json({
                message: 'Проект не найден'
            });
        }

        // список этапов проекта
        const stages = await StageModel.find({ _id: { $in: project.stages } }).exec();

        let allTasks = [];

        // для каждого этапа получить список задач и добавить их в общий список
        for (const stage of stages) {
            const tasks = await TaskModel.find({ _id: { $in: stage.tasks } }).select('name startDate deadline createdDate worker')
            .populate({
                path: 'worker',
                select: 'surname name otch'
            }).exec();
            allTasks = allTasks.concat(tasks);
        }

        return res.json(allTasks);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить список задач для календаря'
        });
    }
}

export const statistics = async (req, res) => {
    try {
        // поиск проекта с задачами
        const project = await ProjectModel.findById(req.headers.projectid)
        .select('stages')
        .populate({
            path: 'stages',
            populate: {
                path: 'tasks',
                select: 'status worker deadline createdDate startDate solution isImportant tags files',
                populate: {
                    path: 'solution',
                    select: 'createdDate'
                }
            },
        });

        if (!project) {
            return res.status(404).json({
                message: 'Проект не найден'
            });
        }

        // сбор статистики по задачам
        const taskStatusCount = {
            statusNew: 0,
            statusInProcess: 0,
            statusDone: 0,
        };

        let totalTasks = 0;
        let totalTaskTime = 0;
        let overdueTasks = 0;
        let importantTasksCount = 0;
        let totalFilesCount = 0;
        const tasksByDeadlineRange = {
            lessThan1Day: 0,
            from1To3Days: 0,
            moreThan3Days: 0,
        };
        const tagCounts = {};
        const employeeTasks = {};
        const employeeIds = new Set();

        project.stages.forEach(stage => {
            stage.tasks.forEach(task => {
                totalTasks++;

                // Подсчет задач по статусам
                if (task.status === 'Новая') {
                    taskStatusCount.statusNew++;
                } else if (task.status === 'Выполняется') {
                    taskStatusCount.statusInProcess++;
                } else if (task.status === 'Завершена') {
                    taskStatusCount.statusDone++;
                }

                // Подсчет важных задач
                if (task.isImportant) {
                    importantTasksCount++;
                }

                // Подсчет времени выполнения задач
                if (task.solution && task.solution.createdDate && task.createdDate) {
                    const taskTime = new Date(task.solution.createdDate) - new Date(task.createdDate);
                    totalTaskTime += taskTime;

                    // Подсчет просроченных задач
                    if (task.deadline && new Date(task.solution.createdDate) > new Date(task.deadline)) {
                        overdueTasks++;
                    }
                }

                // Подсчет задач по срокам выполнения
                const timeLeft = (new Date(task.deadline) - new Date(task.startDate)) / (1000 * 60 * 60 * 24); // дни
                if (timeLeft < 1) {
                    tasksByDeadlineRange.lessThan1Day++;
                } else if (timeLeft <= 3) {
                    tasksByDeadlineRange.from1To3Days++;
                } else {
                    tasksByDeadlineRange.moreThan3Days++;
                }

                // Подсчет задач по сотрудникам
                if (task.worker) {
                    employeeIds.add(task.worker.toString());
                    if (!employeeTasks[task.worker]) {
                        employeeTasks[task.worker] = 0;
                    }
                    employeeTasks[task.worker]++;
                }
            });
        });

        // Загрузка данных о сотрудниках
        const employees = await UserModel.find({ _id: { $in: Array.from(employeeIds) } })
            .select('surname name otch');

        // Создание мапы для быстрого поиска ФИО сотрудника по его ID
        const employeeMap = {};
        employees.forEach(employee => {
            employeeMap[employee._id] = `${employee.surname} ${employee.name} ${employee.otch}`;
        });

        // Преобразование employeeTasks с ID на ФИО
        const employeeTasksWithNames = {};
        for (const [id, count] of Object.entries(employeeTasks)) {
            employeeTasksWithNames[employeeMap[id]] = count;
        }

        const averageTaskTimeMs = totalTasks > 0 ? totalTaskTime / totalTasks : 0;
        const averageTaskTimeHours = averageTaskTimeMs / (1000 * 60 * 60);

        const response = {
            stagesCount: project.stages.length,
            tasksCount: totalTasks,
            taskStatusCount,
            overdueTasks,
            importantTasksCount,
            tasksByDeadlineRange,
            employeeTasks: employeeTasksWithNames,
        };

        return res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статистику по проекту'
        });
    }
}


