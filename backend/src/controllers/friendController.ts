import type { Request, Response } from 'express';
import admin from 'firebase-admin';
const db = admin.firestore();
import { getUserData, fetchUserData } from './userController'; 
const { User } = require('../models/user') // import user models
import * as userController from './userController';
const LEADERBOARD_COLLECTION = 'leaderboard';
