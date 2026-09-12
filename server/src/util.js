// Wraps an async route handler so rejected promises reach Express's error handler
// instead of crashing the process (Express 4 doesn't await handlers itself).
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
