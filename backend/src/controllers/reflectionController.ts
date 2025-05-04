import { Request, Response } from "express";
import admin from "firebase-admin";

const db = admin.firestore();

export const addReflection = async (req: Request, res: Response) => {
  const userId = (req as any).user.uid;
  const { taskId, reflection } = req.body;

  if (!taskId || !reflection) {
    return res.status(400).json({ error: "Missing taskId or reflection text." });
  }

  try {
    // Check if reflection already exists for this user & task
    const existing = await db.collection("reflections")
      .where("userId", "==", userId)
      .where("taskId", "==", taskId)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ error: "You’ve already submitted a reflection for this task." });
    }

    const reflectionDoc = {
      taskId,
      userId,
      reflection,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("reflections").add(reflectionDoc);
    res.status(200).json({ message: "Reflection saved!" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: "Failed to save reflection", details: err.message });
    } else {
      res.status(500).json({ error: "Unknown error saving reflection" });
    }
  }
};

export const getReflectionForTask = async (req: Request, res: Response) => {
    const userId = (req as any).user.uid;
    const { taskId } = req.params;
  
    try {
      const snapshot = await db.collection("reflections")
        .where("userId", "==", userId)
        .where("taskId", "==", taskId)
        .limit(1)
        .get();
  
      if (snapshot.empty) {
        return res.status(200).json({ reflection: null });
      }
  
      const doc = snapshot.docs[0].data();
      res.status(200).json({ reflection: doc.reflection });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch reflection" });
    }
  };