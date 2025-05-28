function createResponseHelper(res) {
    return {
        success: (data = {}) => {
            return res.json({
                result: true,
                data: data,
                error: null
            });
        },
        error: (message = 'Error interno') => {
            return res.json({
                result: false,
                data: null,
                error: message
            });
        }
    };
}

module.exports = createResponseHelper;