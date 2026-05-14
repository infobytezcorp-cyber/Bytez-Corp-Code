import express from 'express';
import { businessTrends, usersTrends } from '../controllers/trendsController.js';

const router = express.Router();

router.get('/business', businessTrends);
router.get('/users', usersTrends);

export default router;
