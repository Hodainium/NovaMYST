import express from 'express';
import { getShopItems, purchaseItem, equipItem } from '../controllers/shopController';
const { authenticateFirebaseToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/items', getShopItems);
router.post('/purchase/:itemID', authenticateFirebaseToken, purchaseItem);
router.post('/equip/:itemID', authenticateFirebaseToken, equipItem);

export default router;