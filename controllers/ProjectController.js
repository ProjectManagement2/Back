import ProjectModel from '../models/Project.js'
import PermissionModel from '../models/Permission.js';
import OrganizationModel from '../models/Organization.js';
import UserModel from '../models/User.js';
import MessageModel from '../models/Message.js';
import StageModel from '../models/Stage.js';
import TaskModel from '../models/Task.js';

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
        const projectLeaders = await ProjectModel.findById(req.headers.projectid).select('projectLeaders')
        .populate({
            path: 'projectLeaders',
            select: 'surname name otch email',
        });

        if (!projectLeaders) {
            return res.status(404).json({
                message: 'Проект не найден'
            });
        }

        return res.json(projectLeaders);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить информацию о руководителях проекта'
        });
    }
}

export const addMessage = async (req, res) => {
    try {
        // поиск проекта
        const project = await ProjectModel.findById(req.headers.projectid);
        if (!project) {
            return res.status(404).json({
                message: 'Проект не найден'
            });
        }

        // создание сообщения
        const doc = new MessageModel({
            text: req.body.text,
            author: req.userId,
        });
        const message = await doc.save();

        // добавление нового сообщения в проект
        ProjectModel.findOneAndUpdate(
            { _id: project._doc._id },
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
        // поиск сообщений
        const messages = await ProjectModel.findById(req.headers.projectid).select('messages')
        .populate({
            path: 'messages',
            select: 'text author',
            populate: {
                path: 'author',
                select: 'surname name otch'
            }
        });

        if (!messages) {
            return res.status(404).json({
                message: 'Сообщения не найдены'
            });
        }

        return res.json(messages);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить сообщения'
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

        // проверка прав доступа на создание этапа
        const permission = await PermissionModel.findOne({user: req.userId, project: project._doc._id, role: 'ProjectLeader'});
        if (!permission) {
            return res.status(404).json({
                message: 'У вас нет прав на создание этапа'
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
        // поиск этапов
        const stages = await ProjectModel.findById(req.headers.projectid).select('stages')
        .populate({
            path: 'stages',
            select: 'name description',
        });

        if (!stages) {
            return res.status(404).json({
                message: 'Этапы не найдены'
            });
        }

        return res.json(stages);
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
        const permission = await PermissionModel.findOne({user: req.userId, project: project._doc._id, role: 'ProjectLeader'});
        if (!permission) {
            return res.status(404).json({
                message: 'У вас нет прав на создание этапа'
            });
        }

        // создание задачи
        const doc = new TaskModel({
            name: req.body.name,
            description: req.body.description,
            deadline: req.body.deadline,
            isImportant: req.body.isImportant,
            tags: req.body.tags,
            worker: req.body.worker
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