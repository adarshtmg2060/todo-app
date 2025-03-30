"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({
            errors: result.error.format(),
        });
        return; // Don't return the Response object, just exit here
    }
    next();
};
exports.validate = validate;
