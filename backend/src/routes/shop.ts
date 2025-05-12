import express from 'express';
import { getShopItems, purchaseItem, equipItem, unequipSlot } from '../controllers/shopController';
const { authenticateFirebaseToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/items', getShopItems);
router.post('/purchase/:itemID', authenticateFirebaseToken, purchaseItem);
router.post('/equip/:itemID', authenticateFirebaseToken, equipItem);
router.post('/unequip/:slot', authenticateFirebaseToken, unequipSlot);

export default router;