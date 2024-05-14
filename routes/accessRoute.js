import { Router } from "express";

import * as AccessController from '../controllers/AccessController.js';
import checkAuth from '../utils/checkAuth.js';

const router = new Router();

// проверка лидера организации
// /api/access/checkOrgLeader
router.get('/checkOrgLeader', checkAuth, AccessController.checkOrgLeader);

// проверка лидера проекта
// /api/access/checkProjectLeader
router.get('/checkProjectLeader', checkAuth, AccessController.checkProjectLeader);

// проверка исполнителя задачи
// /api/access/checkTaskWorker
router.get('/checkTaskWorker', checkAuth, AccessController.checkTaskWorker);

export default router;