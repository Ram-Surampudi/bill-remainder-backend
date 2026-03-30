import {body} from 'express-validator';
import { AvailableRoles } from '../utils/constants';

const userLoginValidatior = () =>{
    return [
        body('email')
            .optional()
            .trim()
            .notEmpty()
            .withMessage("email Should not be empty")
            .isEmail()
            .withMessage("invalid email"),
        body('username')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('username is required')
            .toLowerCase()
            .withMessage('username must be in lower case')
            .isLength({min:6})
            .withMessage("username should have min 3 characters"),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('password is required')
            .isLength({min : 8})
            .withMessage('password should have min 8 characters')
    ]
}

const userResetForgotPasswordValidator = () =>{
    return [
        body('newPassword')
            .trim()
            .notEmpty()
            .withMessage("new Password Should not be empty")
            .isLength({min : 6})
            .withMessage('len of password should be minimun of 6 characters')
    ]
}

const userForgotPasswordValidator = () =>{
    return [
        body('email')
            .trim()
            .notEmpty()
            .withMessage("email Should not be empty")
            .isEmail()
            .withMessage("invalid email")
    ]
}

const changeCurrentPasswordValidator = () =>{
    return [
        body('oldPassword')
            .trim()
            .notEmpty()
            .withMessage("old Password Should not be empty"),
        body('newPassword')
            .trim()
            .notEmpty()
            .withMessage("new Password Should not be empty")
    ]
}

export const userRegisValidator = () =>{
    return [
        body('username')
            .trim()
            .notEmpty()
            .withMessage('username should not be empty')
            .contains(" ")
            .withMessage("please avoid spaces in username")
            .toLowerCase()
            .withMessage('username must be in lower case')
            .isLength({min:6})
            .withMessage("username should contain minimum of 6 character"),
        body('email')
            .trim()
            .notEmpty()
            .withMessage("email Should not be empty")
            .isEmail()
            .withMessage("invalid email"),
        body('fullName')
            .trim()
            .notEmpty()
            .withMessage('username should not be empty'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage("Password Should not be empty")
            .isLength({min:8})
            .withMessage("username should contain minimum of 8 character"),
        body('role')
            .notEmpty()
            .withMessage('role is required')
            .isIn(AvailableRoles)
            .withMessage('invalid role')
    ]
}

export const createTenantValidator = () => {
    return [
        body('organizationName')
            .trim()
            .notEmpty()
            .withMessage("Organization name is required")
            .isLength({ min: 7 })
            .withMessage("Organization name must be at least 3 characters"),

        body('description')
            .optional()
            .trim()
            .isLength({ max: 700 })
            .withMessage("Description should not exceed 500 characters"),

        body('founderName')
            .optional()
            .trim()
            .isLength({ min: 3 })
            .withMessage("Founder name must be at least 3 characters"),

        body('slug')
            .notEmpty()
            .withMessage("Slug is required")
            .isSlug()
            .withMessage("Slug must be URL-friendly (e.g., tech-corp)")
            .toLowerCase(),

        body('email')
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email"),

        body('pics')
            .optional()
            .isArray()
            .withMessage("Pics must be an array of image URLs"),

        body('pics.*')
            .optional()
            .isURL()
            .withMessage("Each pic must be a valid URL"),

        body('logo')
            .optional()
            .isURL()
            .withMessage("Logo must be a valid URL"),

        body('contactNumber')
            .optional()
            .isMobilePhone('en-IN')
            .withMessage("Invalid contact number"),

        body('address')
            .optional()
            .trim()
            .isLength({ min: 5 })
            .withMessage("Address must be at least 5 characters long")
    ];
};

export const updateTenantValidator = () =>{
    [
        body('organizationName')
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Organization name is required")
            .isLength({ min: 7 })
            .withMessage("Organization name must be at least 3 characters"),

        body('description')
            .optional()
            .trim()
            .isLength({ max: 700 })
            .withMessage("Description should not exceed 500 characters"),

        body('founderName')
            .optional()
            .trim()
            .isLength({ min: 3 })
            .withMessage("Founder name must be at least 3 characters"),

        body('slug')
            .optional()
            .notEmpty()
            .withMessage("Slug is required")
            .isSlug()
            .withMessage("Slug must be URL-friendly (e.g., tech-corp)")
            .toLowerCase(),

        body('email')
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email"),

        body('pics')
            .optional()
            .isArray()
            .withMessage("Pics must be an array of image URLs"),

        body('pics.*')
            .optional()
            .isURL()
            .withMessage("Each pic must be a valid URL"),

        body('logo')
            .optional()
            .isURL()
            .withMessage("Logo must be a valid URL"),

        body('contactNumber')
            .optional()
            .isMobilePhone('en-IN')
            .withMessage("Invalid contact number"),

        body('address')
            .optional()
            .trim()
            .isLength({ min: 5 })
            .withMessage("Address must be at least 5 characters long")
    ];
}



export { 
    userLoginValidatior , 
    changeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator
};