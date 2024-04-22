import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoute from './routes/authRoute.js';
import profileRoute from './routes/profileRoute.js';
import adminRoute from './routes/adminRoute.js';
import organizationRoute from './routes/organizationRoute.js';
// import projectRoute from './routes/projectRoute.js';

//подключение к БД
mongoose
    .connect('mongodb://127.0.0.1:27017')
    .then(() => {console.log('DB ok')})
    .catch((err) => {console.log('DB error', err)})

const app = express();
app.use(express.json());
app.use(cors());


// роут на авторизацию
app.use('/api/auth', authRoute);

// роут на работу с пользователем
app.use('/api/profile', profileRoute);

// роут на работу с администратором
app.use('/api/admin', adminRoute);

// роут на работу с организацией
app.use('/api/organization', organizationRoute);

// роут на работу с проектом
// app.use('/api/project', projectRoute);


app.listen(4444, (err) => {
    if (err) {
        console.log(err);
    }

    console.log('Server OK');
});