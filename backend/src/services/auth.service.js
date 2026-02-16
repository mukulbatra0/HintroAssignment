import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Authentication Service
 * Contains business logic for authentication operations
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const { name, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('User with this email already exists');
    }

    // Create new user (password hashing is done in User model pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token
    const token = user.generateAuthToken();

    return { user, token };
  }

  /**
   * Login user with credentials
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from user object
    user.password = undefined;

    return { user, token };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const { name, avatar } = updateData;

    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    return user;
  }

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify current password
    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    // Update password (will be hashed in pre-save hook)
    user.password = newPassword;
    await user.save();

    return user;
  }
}

export default new AuthService();
