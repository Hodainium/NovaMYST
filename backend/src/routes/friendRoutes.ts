import { Router } from 'express';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import {
  sendFriendRequest,
  getReceivedFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  getFriendsList,
  removeFriend,
} from '../controllers/friendController';

const router = Router();

// Wrap async middleware manually because having issues with overload
const wrapAsync = (fn: any) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  

router.post('/request', wrapAsync(authenticateFirebaseToken), sendFriendRequest);
router.get('/requests', wrapAsync(authenticateFirebaseToken), getReceivedFriendRequests);
router.post('/accept/:requestId', wrapAsync(authenticateFirebaseToken), acceptFriendRequest);
router.post('/decline/:requestId', wrapAsync(authenticateFirebaseToken), declineFriendRequest);
router.get('/list', wrapAsync(authenticateFirebaseToken), getFriendsList);
router.delete('/remove/:friendId', wrapAsync(authenticateFirebaseToken), removeFriend);

export default router;
