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
        // поиск проекта
        const project = await ProjectModel.findById(req.headers.projectid).select('name description initiator')
        .populate({
            path: 'initiator',
            select: 'surname name otch',
        });

        if (!project) {
            return res.status(404).json({
                message: 'Проект не найден'
            });
        }
        
        return res.json(project);
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

        // создание этапа
        const doc = new StageModel({
            name: req.body.name,
            description: req.body.description,
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
            select: 'name description',
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

        // проверка прав доступа лидера проекта
        // const permission = await PermissionModel.findOne({user: req.userId, project: project._doc._id, role: 'ProjectLeader'});
        // if (!permission) {
        //     return res.status(404).json({
        //         message: 'У вас нет прав на создание этапа'
        //     });
        // }

        // создание задачи
        const doc = new TaskModel({
            name: req.body.name,
            description: req.body.description,
            deadline: req.body.deadline,
            isImportant: req.body.isImportant,
            tags: req.body.tags,
            worker: req.body.worker,
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