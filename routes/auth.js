const express = require('express');
const router = express.Router();
const { validateAuth } = require('../middleware/validation');
const { signUp, signIn, signOut, getCurrentUser } = require('../controllers/loginController');

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Registration failed
 */
router.post('/signup', validateAuth, signUp);

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: Sign in user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sign in successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/signin', validateAuth, signIn);

/**
 * @swagger
 * /api/auth/signout:
 *   post:
 *     summary: Sign out user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Sign out successful
 */
router.post('/signout', signOut);

/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Not authenticated
 */
router.get('/user', getCurrentUser);

module.exports = router;