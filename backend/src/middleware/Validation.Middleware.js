const { body, validationResult, oneOf } = require("express-validator");

const respondWithValidationErrors = (req,res,next) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        const errs = error.array();
        return res.status(400).json({ message: errs[0].msg || 'Validation error', errors: errs });
    }

    next();
}

const registerUserValidations = [
    body("email")
        .isEmail()
        .withMessage("Invalid email address"),
    body("password")
        .isLength({ min: 6})
        .withMessage("password must be atleast 6 character long"),
    body("firstname")
        .isString()
        .withMessage("Firstname must be string"),
    body("lastname")
        .isString()
        .withMessage("lastname must be string"),
    respondWithValidationErrors
]

const loginUserValidations = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password')
        .isLength({ min: 6})
        .withMessage("password must be atleast 6 character long"),
    respondWithValidationErrors
]

module.exports = {
    registerUserValidations,
    loginUserValidations
}
