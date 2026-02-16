import { HTTP_STATUS } from '../config/constants.js';

/**
 * Standardized API response structure
 */
export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  static success(data, message = 'Success') {
    return new ApiResponse(HTTP_STATUS.OK, data, message);
  }

  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(HTTP_STATUS.CREATED, data, message);
  }

  static noContent(message = 'No content') {
    return new ApiResponse(HTTP_STATUS.NO_CONTENT, null, message);
  }
}

/**
 * Send success response
 */
export const sendSuccess = (res, statusCode, data, message) => {
  const response = new ApiResponse(statusCode, data, message);
  return res.status(statusCode).json(response);
};
