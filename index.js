import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import path from 'path';
import { fileURLToPath } from 'url';

import authRoute from './routes/authRoute.js';
import profileRoute from './routes/profileRoute.js';
import adminRoute from './routes/adminRoute.js';
import organizationRoute from './routes/organizationRoute.js';
import projectRoute from './routes/projectRoute.js';
import taskRoute from './routes/taskRoute.js';
import accessRoute from './routes/accessRoute.js';

//подключение к БД
mongoose
    .connect('mongodb://127.0.0.1:27017')
    .then(() => {console.log('DB ok')})
    .catch((err) => {console.log('DB error', err)})

const app = express();

app.use(express.json());
app.use(cors());

// создание переменных __filename и __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// маршрут для скачивания файлов
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '/uploads', filename);

    res.download(filePath, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      }
    });
  });


// роут на авторизацию
app.use('/api/auth', authRoute);

// роут на работу с пользователем
app.use('/api/profile', profileRoute);

// роут на работу с администратором
app.use('/api/admin', adminRoute);

// роут на работу с организацией
app.use('/api/organization', organizationRoute);

// роут на работу с проектом
app.use('/api/project', projectRoute);

// роут на работу с задачей
app.use('/api/task', taskRoute);

// роут на проверку прав доступа
app.use('/api/access', accessRoute);


app.listen(4444, (err) => {
    if (err) {
        console.log(err);
    }

    console.log('Server OK');
});