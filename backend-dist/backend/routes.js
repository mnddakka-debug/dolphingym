import express from 'express';
import { authenticate, authorize } from './middleware/auth.middleware.js';
import { validateProfileUpdateFields } from './middleware/validation.middleware.js';
import { AdminController } from './controllers/admin.controller.js';
import { TrainerController } from './controllers/trainer.controller.js';
import { PlayerController } from './controllers/player.controller.js';
const router = express.Router();
// --- ADMIN ROUTES ---
router.get('/admin/users', authenticate, authorize(['admin']), AdminController.getAllUsers);
router.put('/admin/users/:userId', authenticate, authorize(['admin']), AdminController.updateUser);
router.patch('/admin/users/:userId/status', authenticate, authorize(['admin']), AdminController.updateUserStatus);
router.post('/admin/users/:userId/reset-password', authenticate, authorize(['admin']), AdminController.resetUserPassword);
// --- TRAINER ROUTES ---
router.get('/trainer/my-players', authenticate, authorize(['trainer']), TrainerController.getMyPlayers);
router.post('/trainer/workout', authenticate, authorize(['trainer']), TrainerController.assignWorkout);
// --- PLAYER ROUTES ---
router.get('/player/profile', authenticate, authorize(['player']), PlayerController.getProfile);
// Secure Profile Update with Whitelist Validation
router.put('/player/profile', authenticate, authorize(['player']), validateProfileUpdateFields, PlayerController.updateProfile);
router.get('/player/workouts', authenticate, authorize(['player']), PlayerController.getMyWorkouts);
export default router;
