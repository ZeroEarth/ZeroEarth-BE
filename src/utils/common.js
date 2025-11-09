module.exports = {
    sendSuccessResponse: (res, data, message = "Success", statusCode = 200) => {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    },

    sendErrorResponse: (res, error={}, message = "Something went wrong") => {
        // console.error(error); 
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || message,
            error: error.statusCode ? {} : error
        });
    },

    getPaginationParams: ({ page = null, offset = null, limit = 10, order = "ASC" }) => {
        limit = Math.max(parseInt(limit, 10) || 10, 1);
        order = ["ASC", "DESC"].includes(order.toUpperCase()) ? order.toUpperCase() : "ASC";
    
        if (page === null && offset === null) {
            page = 1;
        }
    
        if (page !== null) {
            page = Math.max(parseInt(page, 10) || 1, 1);
            offset = (page - 1) * limit;
        } else {
            offset = Math.max(parseInt(offset, 10) || 0, 0);
        }
    
        return { page, offset, limit, order };
    },    
}