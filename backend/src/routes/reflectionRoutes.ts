import express from "express";
import { addReflection, getReflectionForTask } from "../controllers/reflectionController";
import { authenticateFirebaseToken } from "../middleware/authMiddleware";

const router = express.Router();

// Wrap async middleware manually because having issues with overload
const wrapAsync = (fn: any) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

router.post("/reflections", wrapAsync(authenticateFirebaseToken), wrapAsync(addReflection));
router.get("/reflections/:taskId", wrapAsync(authenticateFirebaseToken), wrapAsync(getReflectionForTask));

export default router;
