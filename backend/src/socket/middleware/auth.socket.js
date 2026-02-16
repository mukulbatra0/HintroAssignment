import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { logger } from '../../utils/logger.js';


/**
 * Socket.io authentication middleware
 * Authenticates users connecting via WebSocket
 */
export const socketAuth = async (socket, next) => {
  try {
    // Get token from handshake auth or query
    const token = 
      socket.handshake.auth.token || 
      socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      logger.warn('Socket connection attempt without token');
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      logger.warn(`Socket auth failed: User ${decoded.id} not found`);
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user to socket
    socket.user = user;
    
    logger.info(`Socket authenticated: ${user.email} (${socket.id})`);
    next();
  } catch (error) {
    logger.error('Socket authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Authentication error: Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication error: Token expired'));
    }
    
    return next(new Error('Authentication error'));
  }
};
