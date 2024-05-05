import { Router } from "express";

import * as OrganizationController from '../controllers/OrganizationController.js';

import checkAuth from '../utils/checkAuth.js';
import checkOrgLeader from '../utils/checkOrgLeader.js';

const router = new Router();

// вывод основной информации об организации
//  /api/organization/mainInfo
router.get('/mainInfo', checkAuth, OrganizationController.mainInfo);

// создание проекта
// /api/organization/createProject
router.post('/createProject', checkAuth, checkOrgLeader, OrganizationController.createProject);

// вывод списка проектов организации
// /api/organization/getProjects
router.get('/getProjects', checkAuth, OrganizationController.getProjects);

// добавление пользователя в организацию
// /api/organization/addUser
router.post('/addUser', checkAuth, checkOrgLeader, OrganizationController.addUser);

// вывод пользователей, которых можно добавить в организацию
// /api/organization/allUsers
router.get('/allUsers', checkAuth, OrganizationController.allUsers);

// вывод участников организации
// /api/organization/getMembers
router.get('/getMembers', checkAuth, OrganizationController.getMembers);

export default router;