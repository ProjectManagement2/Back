import ProjectModel from '../models/Project.js'

export const createProject = async (req, res) => {
    try {
        const doc = new ProjectModel({
            name: req.body.name,
            description: req.body.description,
            initiator: req.userId,
        });
        const project = await doc.save();

        return res.json({
            message: 'Создан новый проект'
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось создать проект'
        });
    }
}