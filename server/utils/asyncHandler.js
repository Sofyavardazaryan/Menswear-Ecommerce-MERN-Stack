/**
 * Wraps an async route handler and forwards any rejected promise to Express next().
 * Eliminates repetitive try/catch in every controller.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
