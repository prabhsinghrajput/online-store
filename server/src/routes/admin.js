import { Router } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { requireRole, clearRoleCache } from '../middleware/roles.js';
import { z } from 'zod';

const router = Router();

// Validation schemas
const assignRoleSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'moderator', 'user']),
  expiresAt: z.string().datetime().optional(),
});

/**
 * GET /api/admin/roles
 * Get all users with roles (admin only)
 */
router.get('/roles', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .order('granted_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

/**
 * GET /api/admin/roles/:email
 * Get role for specific email
 */
router.get('/roles/:email', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('email', req.params.email)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.json({ email: req.params.email, role: 'user', isActive: false });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

/**
 * POST /api/admin/roles
 * Assign role to user (admin only)
 */
router.post('/roles', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { email, role, expiresAt } = assignRoleSchema.parse(req.body);

    // First, find the user by email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) throw userError;

    const targetUser = userData.users.find(u => u.email === email);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    // Check if role already exists
    const { data: existing } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', targetUser.id)
      .maybeSingle();

    let result;
    if (existing) {
      // Update existing role
      const { data, error } = await supabaseAdmin
        .from('user_roles')
        .update({
          role,
          expires_at: expiresAt || null,
          is_active: true,
          granted_by: req.user.id,
          granted_at: new Date().toISOString(),
        })
        .eq('user_id', targetUser.id)
        .select()
        .single();

      if (error) throw error;
      result = data;

      // Clear cache for affected user
      clearRoleCache(targetUser.id);
    } else {
      // Insert new role
      const { data, error } = await supabaseAdmin
        .from('user_roles')
        .insert([{
          user_id: targetUser.id,
          email: targetUser.email,
          role,
          expires_at: expiresAt || null,
          granted_by: req.user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Also update user metadata for immediate effect
    await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
      user_metadata: {
        ...targetUser.user_metadata,
        role,
        isAdmin: role === 'admin',
      }
    });

    res.status(201).json({
      message: `Role ${role} assigned to ${email}`,
      role: result
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    res.status(500).json({ error: 'Failed to assign role' });
  }
});

/**
 * DELETE /api/admin/roles/:email
 * Remove role from user (admin only)
 */
router.delete('/roles/:email', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const email = req.params.email;

    // Find user by email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) throw userError;

    const targetUser = userData.users.find(u => u.email === email);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove or deactivate the role
    const { error } = await supabaseAdmin
      .from('user_roles')
      .update({ is_active: false })
      .eq('user_id', targetUser.id);

    if (error) throw error;

    // Clear cache
    clearRoleCache(targetUser.id);

    // Update user metadata
    await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
      user_metadata: {
        ...targetUser.user_metadata,
        role: 'user',
        isAdmin: false,
      }
    });

    res.json({ message: `Role removed from ${email}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove role' });
  }
});

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
router.get('/users', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) throw error;

    // Enrich with role information
    const usersWithEmails = await Promise.all(
      data.users.map(async (user) => {
        const { data: roleData } = await supabaseAdmin
          .from('user_roles')
          .select('role, is_active, expires_at')
          .eq('user_id', user.id)
          .maybeSingle();

        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          role: roleData?.role || 'user',
          is_active: roleData?.is_active ?? false,
        };
      })
    );

    res.json(usersWithEmails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
