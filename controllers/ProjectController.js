import ProjectModel from '../models/Project.js'
import PermissionModel from '../models/Permission.js';
import OrganizationModel from '../models/Organization.js';
import UserModel from '../models/User.js';
import MessageModel from '../models/Message.js';

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