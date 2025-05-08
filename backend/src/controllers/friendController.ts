import type { Request, Response } from 'express';
import admin from 'firebase-admin';
const db = admin.firestore();
import { fetchUserData } from './userController'; 
import { updateLeaderboard } from './leaderboardController';

const FRIENDS_COLLECTION = 'friends';

// --- SEND FRIEND REQUEST ---
export const sendFriendRequest = async (req: Request, res: Response): Promise<void> => {
    const requesterId = (req as any).user.uid;
    let { recipientId, username } = req.body; // get both fields!
  
    if (!recipientId && !username) {
      res.status(400).json({ error: 'Recipient ID or Username is required.' });
      return;
    }
  
    try {
      // If username is provided, find the recipientId
      if (username) {
        const userSnapshot = await db.collection('users').where('userName', '==', username).limit(1).get();
        if (userSnapshot.empty) {
          res.status(404).json({ error: 'Username not found.' });
          return;
        }
        recipientId = userSnapshot.docs[0].data().userID;
      }
  
      if (requesterId === recipientId) {
        res.status(400).json({ error: 'Cannot send a friend request to yourself.' });
        return;
      }
  
      const recipientData = await fetchUserData(recipientId);
      if (!recipientData) {
        res.status(404).json({ error: 'Recipient user not found.' });
        return;
      }
  
      const existingRequest = await db.collection(FRIENDS_COLLECTION)
        .where('requesterId', 'in', [requesterId, recipientId])
        .where('recipientId', 'in', [requesterId, recipientId])
        .get();
  
      if (!existingRequest.empty) {
        res.status(409).json({ error: 'Friend request already pending or users already friends.' });
        return;
      }
  
      await db.collection(FRIENDS_COLLECTION).add({
        requesterId,
        recipientId,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  
      res.status(201).json({ message: 'Friend request sent.' });
    } catch (error: unknown) {
      console.error('Error sending friend request:', error);
      res.status(500).json({ error: 'Failed to send friend request.' });
    }
  };
  

// --- GET RECEIVED FRIEND REQUESTS ---
export const getReceivedFriendRequests = async (req: Request, res: Response): Promise<void> => {
  const recipientId = (req as any).user.uid; // probably gonna have to change in here too
  
  try {
    const snapshot = await db.collection(FRIENDS_COLLECTION)
      .where('recipientId', '==', recipientId)
      .where('status', '==', 'pending')
      .get();

    const friendRequests = await Promise.all(snapshot.docs.map(async doc => {
      const data = doc.data();
      const requesterData = await fetchUserData(data.requesterId);
      return requesterData ? { id: doc.id, requester: requesterData, createdAt: data.createdAt } : null;
    }));

    res.status(200).json(friendRequests.filter(Boolean));
  } catch (error: unknown) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ error: 'Failed to fetch friend requests.' });
  }
};

// --- ACCEPT FRIEND REQUEST ---
export const acceptFriendRequest = async (req: Request, res: Response): Promise<void> => {
  const recipientId = (req as any).user.uid;
  const { requestId } = req.params;

  try {
    const requestRef = db.collection(FRIENDS_COLLECTION).doc(requestId);
    const doc = await requestRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: 'Friend request not found.' });
      return;
    }

    const requestData = doc.data();
    if (!requestData || requestData.recipientId !== recipientId || requestData.status !== 'pending') {
      res.status(403).json({ error: 'Invalid or unauthorized friend request.' });
      return;
    }

    await requestRef.update({ status: 'accepted' });

    res.status(200).json({ message: 'Friend request accepted.' });
  } catch (error: unknown) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Failed to accept friend request.' });
  }
};

// --- DECLINE FRIEND REQUEST ---
export const declineFriendRequest = async (req: Request, res: Response): Promise<void> => {
  const recipientId = (req as any).user.uid;
  const { requestId } = req.params;

  try {
    const requestRef = db.collection(FRIENDS_COLLECTION).doc(requestId);
    const doc = await requestRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: 'Friend request not found.' });
      return;
    }

    const requestData = doc.data();
    if (!requestData || requestData.recipientId !== recipientId || requestData.status !== 'pending') {
      res.status(403).json({ error: 'Invalid or unauthorized friend request.' });
      return;
    }

    await requestRef.update({ status: 'declined' });

    res.status(200).json({ message: 'Friend request declined.' });
  } catch (error: unknown) {
    console.error('Error declining friend request:', error);
    res.status(500).json({ error: 'Failed to decline friend request.' });
  }
};

// --- GET FRIENDS LIST ---
export const getFriendsList = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.uid;

  try {
    const snapshot1 = await db.collection(FRIENDS_COLLECTION)
      .where('status', '==', 'accepted')
      .where('requesterId', '==', userId)
      .get();

    const snapshot2 = await db.collection(FRIENDS_COLLECTION)
      .where('status', '==', 'accepted')
      .where('recipientId', '==', userId)
      .get();

    const friendsFromRequester = snapshot1.docs.map(doc => doc.data().recipientId);
    const friendsFromRecipient = snapshot2.docs.map(doc => doc.data().requesterId);
    const allFriendIds = [...friendsFromRequester, ...friendsFromRecipient];

    const friendsData = await Promise.all(allFriendIds.map(async (friendId) => {
      return await fetchUserData(friendId);
    }));

    res.status(200).json(friendsData.filter(Boolean));
  } catch (error: unknown) {
    console.error('Error fetching friends list:', error);
    res.status(500).json({ error: 'Failed to fetch friends list.' });
  }
};

// --- REMOVE A FRIEND ---
export const removeFriend = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.uid;
  const { friendId } = req.params;

  try {
    const friendshipSnapshot = await db.collection(FRIENDS_COLLECTION)
      .where('status', '==', 'accepted')
      .where('requesterId', 'in', [userId, friendId])
      .where('recipientId', 'in', [userId, friendId])
      .get();

    if (friendshipSnapshot.empty) {
      res.status(404).json({ error: 'Friendship not found.' });
      return;
    }

    const batch = db.batch();
    friendshipSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
    res.status(200).json({ message: 'Friend removed successfully.' });
  } catch (error: unknown) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Failed to remove friend.' });
  }
};

export const inviteToLeaderboard = async (req: Request, res: Response): Promise<void> => {
  const senderId = (req as any).user.uid;
  const { friendId } = req.body;

  console.log(`[InviteToLeaderboard] ${senderId} is inviting ${friendId}`);

  try {
    const snapshot = await db.collection('friends')
      .where('status', '==', 'accepted')
      .where('requesterId', 'in', [senderId, friendId])
      .where('recipientId', 'in', [senderId, friendId])
      .get();

    if (snapshot.empty) {
      res.status(404).json({ error: 'Friendship not found.' });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    const currentInvite = data.leaderboardInvite;
    // Prevent invites if already mutual
    if (currentInvite === 'mutual') {
      res.status(409).json({ error: 'Already on leaderboard together.' });
      return;
      
    }
    let newInviteStatus: string;

    // Check if the friend has already invited the sender
    if (currentInvite === senderId) {
      newInviteStatus = 'mutual';
    } else {
      newInviteStatus = friendId; // Sender invites friend, so we store friendId
    }

    await doc.ref.update({ leaderboardInvite: newInviteStatus });
    console.log(`[InviteToLeaderboard] Updated invite status to ${newInviteStatus}`);

    res.status(200).json({ message: 'Invite sent.' });
  } catch (error) {
    console.error('Error inviting to leaderboard:', error);
    res.status(500).json({ error: 'Internal error.' });
  }
};


export const acceptLeaderboardInvite = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.uid;
  const { friendId } = req.body;

  try {
    const snapshot = await db.collection(FRIENDS_COLLECTION)
      .where('status', '==', 'accepted')
      .where('requesterId', 'in', [userId, friendId])
      .where('recipientId', 'in', [userId, friendId])
      .get();

    if (snapshot.empty) {
      console.warn(`[Accept Invite] No friendship found between ${userId} and ${friendId}`);
      res.status(404).json({ error: 'Friendship not found.' });
      return;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    const currentInvite = data.leaderboardInvite;

    let newInviteStatus: string;

    if (currentInvite === userId) {
      // They already invited us — now it's mutual
      newInviteStatus = 'mutual';
    } else {
      // We are inviting them now
      newInviteStatus = userId;
    }

    await doc.ref.update({ leaderboardInvite: newInviteStatus });

    console.log(`[Accept Invite] ${userId} accepted invite. New status: ${newInviteStatus}`);
    res.status(200).json({ message: 'Leaderboard invite processed.' });
  } catch (error) {
    console.error('Error accepting leaderboard invite:', error);
    res.status(500).json({ error: 'Failed to accept leaderboard invite.' });
  }
};

export const declineLeaderboardInvite = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.uid;
  const { friendId } = req.body;

  try {
    const snapshot = await db.collection('friends')
      .where('status', '==', 'accepted')
      .where('requesterId', 'in', [userId, friendId])
      .where('recipientId', 'in', [userId, friendId])
      .get();

    if (snapshot.empty) {
      res.status(404).json({ error: 'Friendship not found.' });
      return;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Only decline if the invite was for the user
    const currentInvite = data.leaderboardInvite;
    if (currentInvite !== userId) {
      res.status(403).json({ error: 'No pending invite from this user.' });
    }

    await doc.ref.update({
      leaderboardInvite: admin.firestore.FieldValue.delete()
    });

    console.log(`[Decline Leaderboard] ${userId} declined invite from ${friendId}`);
    res.status(200).json({ message: 'Leaderboard invite declined.' });
  } catch (error) {
    console.error('Error declining leaderboard invite:', error);
    res.status(500).json({ error: 'Failed to decline leaderboard invite.' });
  }
};



export const removeFromLeaderboard = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.uid;
  const { friendId } = req.params;

  try {
    const snapshot = await db.collection(FRIENDS_COLLECTION)
      .where('status', '==', 'accepted')
      .where('requesterId', 'in', [userId, friendId])
      .where('recipientId', 'in', [userId, friendId])
      .where('leaderboardInvite', '==', 'mutual')
      .get();

    if (snapshot.empty) {
      res.status(404).json({ error: 'Friendship not found or not on leaderboard.' });
      return;
    }

    await snapshot.docs[0].ref.update({ leaderboardInvite: admin.firestore.FieldValue.delete() });
    res.status(200).json({ message: 'Removed from leaderboard.' });
  } catch (error) {
    console.error('Error removing friend from leaderboard:', error);
    res.status(500).json({ error: 'Failed to remove friend from leaderboard.' });
  }
};



export const getLeaderboardInvites = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.uid;

  try {
    const snapshot1 = await db.collection('friends')
      .where('status', '==', 'accepted')
      .where('requesterId', '==', userId)
      .get();

    const snapshot2 = await db.collection('friends')
      .where('status', '==', 'accepted')
      .where('recipientId', '==', userId)
      .get();

    const combined = [...snapshot1.docs, ...snapshot2.docs];
    const pendingInvites = [];

    for (const doc of combined) {
      const data = doc.data();
      const { requesterId, recipientId, leaderboardInvite } = data;

      // You're the recipient of an invite
      if (leaderboardInvite === userId) {
        const inviterId = requesterId === userId ? recipientId : requesterId;
        const inviterSnap = await db.collection('users').doc(inviterId).get();

        if (inviterSnap.exists) {
          const inviterData = inviterSnap.data();
          pendingInvites.push({
            userID: inviterId,
            userName: inviterData?.userName || "Unknown",
          });
        }
      }
    }

    res.status(200).json(pendingInvites);
  } catch (error) {
    console.error('Error fetching leaderboard invites:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard invites.' });
  }
};

// update