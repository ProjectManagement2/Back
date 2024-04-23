import bcrypt from 'bcrypt';
import jwb from 'jsonwebtoken';

import UserModel from '../models/User.js';
import { validationResult } from 'express-validator';

export const register = async (req, res) => {
    try {
        //проверка валидации
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array);
        }

        //шифрование пароля
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        //создание новой записи пользователя
        const doc = new UserModel({
            surname: req.body.surname,
            name: req.body.name,
            otch: req.body.otch,
            date: req.body.date,
            email: req.body.email,
            passwordHash: passwordHash
        });
        const user = await doc.save();

        //создание токена
        const token = jwb.sign({
            _id: user._id
        },
        'secret',
        {
            expiresIn: '30d'
        }
        );

        res.json({
            ...user._doc,
            token
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось зарегистрироваться'
        });
    }
}

export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({email: req.body.email});

        // проверка email
        if (!user) {
            return res.status(404).json({
                message: 'Неверный логин или пароль'
            });
        }

        // проверка пароля
        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

        if (!isValidPass) {
            return res.status(404).json({
                message: 'Неверный логин или пароль'
            });
        }

        //создание токена
        const token = jwb.sign({
            _id: user._id
        },
        'secret',
        {
            expiresIn: '30d'
        }
        );

        res.json({
            ...user._doc,
            token
        })

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось авторизоваться'
        });
    }
}

export const userInfo = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId).select('surname name otch date email');

        return res.json({
            ...user._doc
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить данные пользователя'
        });
    }
}

export const userOrganizations = async (req, res) => {
    const user = await UserModel.findById(req.userId).select('organizations')
    .populate({
        path: 'organizations',
        select: '_id name description',
        });

    return res.json(user.organizations);

}

export const updateUserInfo = async (req, res) => {
    try {
        //проверка валидации
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array);
        }

        //шифрование пароля
        const newPassword = req.body.newPassword;
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // обновление записи пользователя
        const updatedUser = await UserModel.findByIdAndUpdate(
            {_id: req.userId},
            {
                surname: req.body.surname,
                name: req.body.name,
                otch: req.body.otch,
                date: req.body.date,
                email: req.body.email,
                passwordHash: passwordHash
            }
        );

        res.json({message: 'Данные обновлены'});
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось обновить данные'
        });
    }
}