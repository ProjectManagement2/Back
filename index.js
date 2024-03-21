import express from 'express';
import mongoose from 'mongoose';

import {registerValidation} from './validations/auth.js';

import * as UserController from './controllers/UserController.js';
import * as ProjectController from './controllers/ProjectController.js';
import * as AdminController from './controllers/AdminController.js';

import checkAuth from './utils/checkAuth.js';

//подключение к БД
mongoose
    .connect('mongodb://127.0.0.1:27017')
    .then(() => {console.log('DB ok')})
    .catch((err) => {console.log('DB error', err)})

const app = express();
app.use(express.json());

//работа с администратором
app.post('/admin/auth', AdminController.login);
app.post('/admin/profile', checkAuth, AdminController.createOrganization);
app.get('/admin/profile', checkAuth, AdminController.getAllOrganizations);

//работа с пользователями
app.post('/auth/login', UserController.login);
app.post('/auth/register', registerValidation, UserController.register);

//работа с проектом
app.post('/profile/createProject', checkAuth, ProjectController.createProject);

app.listen(4444, (err) => {
    if (err) {
        console.log(err);
    }

    console.log('Server OK');
});