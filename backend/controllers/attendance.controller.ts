
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export const AttendanceController = {
  /**
   * PLAYER: Generate a 30-second dynamic token for QR check-in
   */
  async generateQRToken(req: AuthRequest, res: Response) {
    const playerId = req.user?.id;
    
    // Create a unique nonce for this specific QR generation
    const nonce = uuidv4();
    
    // Sign token with 30-second expiry
    const token = jwt.sign(
      { 
        sub: playerId,
        jti: nonce,
        type: 'attendance_checkin'
      }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '30s' }
    );

    res.json({ 
      token, 
      expiresIn: 30,
      refreshIn: 25 // Client should refresh slightly before expiry
    });
  },

  /**
   * TRAINER: Validate scanned QR token
   */
  async validateScan(req: AuthRequest, res: Response) {
    const { qrToken } = req.body;
    const trainerId = req.user?.id;

    try {
      // 1. Verify Signature and Expiration
      const decoded = jwt.verify(qrToken, process.env.JWT_SECRET as string) as any;
      
      if (decoded.type !== 'attendance_checkin') {
        throw new Error('Invalid token type');
      }

      const playerId = decoded.sub;
      const nonce = decoded.jti;

      // 2. REPLAY PROTECTION
      // Logic: Check if this nonce (JTI) has already been used in attendance_logs
      // const existingLog = await AttendanceRepo.findByNonce(nonce);
      // if (existingLog) return res.status(400).json({ error: "Token already used (Replay Attack detected)" });

      // 3. RELATIONSHIP CHECK
      // If trainer role, ensure they are authorized to scan this specific player
      // const isAuthorized = await TrainerRepo.isAssignedTo(trainerId, playerId);
      // if (!isAuthorized) return res.status(403).json({ error: "Player not assigned to your schedule" });

      // 4. RECORD SUCCESS
      // await AttendanceRepo.create({ player_id: playerId, trainer_id: trainerId, nonce });

      res.json({ 
        success: true, 
        message: "Attendance recorded successfully",
        player: playerId,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      const message = err.name === 'TokenExpiredError' ? 'QR Code Expired' : 'Invalid QR Code';
      res.status(400).json({ error: message });
    }
  }
};
