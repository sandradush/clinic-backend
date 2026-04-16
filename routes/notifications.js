const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUserNotifications,
  getUnreadCount,
  getSentNotifications,
  createNotification,
  markAsRead,
  appointmentStatusNotification,
  updateNotification,
  deleteNotification,
  getUsers
} = require('../controllers/notificationsController');

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', getNotifications);

/**
 * @swagger
 * /api/notifications/user/{user_id}:
 *   get:
 *     summary: Get notifications for a specific user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   message:
 *                     type: string
 *                   type:
 *                     type: string
 *                   user_id:
 *                     type: integer
 *                   sent_by:
 *                     type: string
 *                   sent_by_id:
 *                     type: integer
 *                   is_read:
 *                     type: boolean
 *                   created_at:
 *                     type: string
 *                     format: date-time
 */
router.get('/user/:user_id', getUserNotifications);

/**
 * @swagger
 * /api/notifications/sent/{doctorId}:
 *   get:
 *     summary: Get all notifications sent by a specific doctor
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of sent notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   message:
 *                     type: string
 *                   type:
 *                     type: string
 *                   user_id:
 *                     type: integer
 *                   patient_name:
 *                     type: string
 *                   sent_by_id:
 *                     type: integer
 *                   sent_by:
 *                     type: string
 *                   is_read:
 *                     type: boolean
 *                   created_at:
 *                     type: string
 *                     format: date-time
 */
router.get('/sent/:doctorId', getSentNotifications);

/**
 * @swagger
 * /api/notifications/user/{user_id}/unread-count:
 *   get:
 *     summary: Get unread notification count for a user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unread_count:
 *                   type: integer
 */
router.get('/user/:user_id/unread-count', getUnreadCount);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification for a user
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - user_id
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [general, appointment, alert, reminder, success, info, error]
 *                 default: general
 *               user_id:
 *                 type: integer
 *               sent_by_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Notification created
 */
router.post('/', createNotification);

/**
 * @swagger
 * /api/notifications/appointment-status:
 *   post:
 *     summary: Create an appointment status notification for a patient
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointment_id
 *               - patient_id
 *               - doctor_id
 *               - status
 *             properties:
 *               appointment_id:
 *                 type: integer
 *               patient_id:
 *                 type: integer
 *               doctor_id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, pending]
 *               appointment_date:
 *                 type: string
 *                 format: date
 *               appointment_time:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment notification created
 */
router.post('/appointment-status', appointmentStatusNotification);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.put('/:id/read', markAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   put:
 *     summary: Update a notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *               user_id:
 *                 type: integer
 *               is_read:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification updated
 *       404:
 *         description: Notification not found
 */
router.put('/:id', updateNotification);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification deleted
 *       404:
 *         description: Notification not found
 */
router.delete('/:id', deleteNotification);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users for recipient selection
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', getUsers);

module.exports = router;


/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications with recipient details
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   message:
 *                     type: string
 *                   type:
 *                     type: string
 *                   user_id:
 *                     type: integer
 *                   user_name:
 *                     type: string
 *                   user_email:
 *                     type: string
 *                   user_role:
 *                     type: string
 *                   is_read:
 *                     type: boolean
 *                   created_at:
 *                     type: string
 *                     format: date-time
 */
router.get('/', getNotifications);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - user_id
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [general, appointment, alert, reminder]
 *                 default: general
 *               user_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Notification created
 *       400:
 *         description: Validation error
 */
router.post('/', createNotification);

/**
 * @swagger
 * /api/notifications/{id}:
 *   put:
 *     summary: Update a notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *               user_id:
 *                 type: integer
 *               is_read:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification updated
 *       404:
 *         description: Notification not found
 */
router.put('/:id', updateNotification);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification deleted
 *       404:
 *         description: Notification not found
 */
router.delete('/:id', deleteNotification);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users for recipient selection
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 */
router.get('/users', getUsers);

module.exports = router;
