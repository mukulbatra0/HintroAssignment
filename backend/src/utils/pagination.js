/**
 * Pagination helper utility
 */
export const getPaginationParams = (req) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Create pagination metadata
 */
export const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Create paginated response
 */
export const paginatedResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: getPaginationMeta(total, page, limit),
  };
};
