import {Router} from 'express'
import { createHigherRoles, loginUser, register } from '../controllers/auth.controller.js';
import { checkAllowedToCreateAccount, validatePermissionForAcess, verifyJWT } from '../middlewares/auth.middleware.js';
import {validate} from '../middlewares/validator.middlewares.js';
import {userLoginValidatior, userRegisValidator} from '../validators/index.js'
import { Roles } from '../utils/constants.js';
import { logout, resendEmail, verifyEmail } from '../controllers/user.controller.js';

const router = Router();

router.route("/verify-email/:verificationToken")
        .get(verifyEmail);

router.route("/resend-email-verification")
        .get(verifyJWT , resendEmail);

router.route("/register")
        .post( 
            verifyJWT, 
            validatePermissionForAcess([Roles.ADMIN , Roles.EMPLOYEE, Roles.OWNER, Roles.MANAGER]), 
            checkAllowedToCreateAccount , 
            userRegisValidator() , 
            validate , 
            createHigherRoles );

router.route("/register/:tenantId")
        .post(userRegisValidator() , validate , register);

router.route("/login")
        .post(userLoginValidatior() , validate , loginUser);

router.route("/logout")
        .post(verifyJWT , logout);

export default router;