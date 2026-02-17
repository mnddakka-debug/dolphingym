/**
 * Validates that the request body only contains allowed fields for the user's role.
 * Rejects requests containing "Mass Assignment" attempts.
 */
export const validateProfileUpdateFields = (req, res, next) => {
    const role = req.user?.role;
    const bodyFields = Object.keys(req.body);
    // Define allowed fields per role
    const ALLOWED_PLAYER_FIELDS = [
        'phone',
        'avatar_url',
        'emergency_contact',
        'weight_kg',
        'height_cm'
    ];
    const FORBIDDEN_FIELDS = [
        'id',
        'role',
        'email',
        'full_name',
        'password_hash',
        'subscription_start',
        'subscription_end',
        'status'
    ];
    if (role === 'player') {
        const unauthorizedFields = bodyFields.filter(field => !ALLOWED_PLAYER_FIELDS.includes(field));
        if (unauthorizedFields.length > 0) {
            // SECURITY AUDIT LOGGING
            console.error(`[SECURITY ALERT] Unauthorized modification attempt by Player ${req.user?.id}. 
      Attempted fields: ${unauthorizedFields.join(', ')}`);
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You are not authorized to modify restricted administrative fields.',
                forbiddenFields: unauthorizedFields
            });
        }
    }
    // Admin and Trainer logic could be added here if needed, 
    // but usually Admins are given broader access via a different controller.
    next();
};
