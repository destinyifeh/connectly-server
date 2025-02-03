import {Router} from 'express';
import chatControllers from '../controllers/index.js';

const router = Router();

router.post('/api/v1/user/chat', chatControllers.sendMessageController);

export default router;
