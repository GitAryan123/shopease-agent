
export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const msg = statusCode === 500 ? 'Something went wrong. Please try again later.' : err.message;
  res.status(statusCode).json({
    success: false,
    error: msg,
  });
};
