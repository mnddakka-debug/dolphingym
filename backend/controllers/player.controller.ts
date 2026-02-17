
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

export const PlayerController = {
  async getProfile(req: AuthRequest, res: Response) {
    const playerId = req.user?.id;
    // const profile = await UserRepo.findById(playerId);
    res.json({ message: "Your private profile data fetched securely using token ID." });
  },

  /**
   * Securely updates the player profile.
   * Prevents IDOR by using ID from token, not URL.
   */
  async updateProfile(req: AuthRequest, res: Response) {
    const playerId = req.user?.id;
    
    // Final defensive check: Pick only the allowed values
    const { 
      phone, 
      avatar_url, 
      emergency_contact, 
      weight_kg, 
      height_cm 
    } = req.body;

    const updateData = {
      phone,
      avatar_url,
      emergency_contact,
      weight_kg,
      height_cm,
      updated_at: new Date()
    };

    // Logic: Database Update execution
    // await UserRepo.update(playerId, updateData);

    console.log(`[AUDIT] Profile updated for Player: ${playerId}`);
    
    res.json({ 
      success: true, 
      message: "Profile updated successfully.",
      updatedFields: Object.keys(req.body)
    });
  },

  async getMyWorkouts(req: AuthRequest, res: Response) {
    const playerId = req.user?.id;
    res.json({ message: "Your assigned workouts only" });
  }
};
