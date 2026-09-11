export const errorHandler = (err, req, res, next) => {
    console.error('Unhandled Error:', err);
    if (err.code === 'P2002') {
        return res.status(409).json({ success: false, message: 'A record with this unique field already exists.', });
    }
    if (err.code === 'P2025') {
        return res.status(404).json({ success: false, message: 'The requested record was not found.', });
    }
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({ success: false, message: err.message || 'Internal Server Error', ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), });
};