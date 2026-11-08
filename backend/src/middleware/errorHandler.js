export const errorHandler = (err, req, res, next) => {
    console.error("Internal Server Error:", err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || "An unexpected internal server error occurred",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

