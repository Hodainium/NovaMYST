import { Request, Response, NextFunction } from 'express';
import { admin } from '../index'; // assuming index exports initialized firebase

export const authenticateFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    if (!decoded.email_verified) {
      return res.status(403).json({ error: 'Email not verified' });
    }
    console.log("Verified Firebase token!");
    console.log("Decoded Firebase user:", decoded);

    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error("Firebase token verification failed:", err);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};