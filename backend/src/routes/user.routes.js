import {Router} from 'express'
import { validatePermissionForAcess, verifyJWT } from '../middlewares/auth.middleware.js';
import { changeCurrentPassword, changeUsername, deactivateAccount, getCurrentUser, getUser, refreshAcessToken } from '../controllers/user.controller.js';
import { changeCurrentPasswordValidator } from '../validators/index.js';
import { Roles } from '../utils/constants.js';
import { validate } from '../middlewares/validator.middlewares.js';

const router = Router();


router.route("/current-user").get(verifyJWT , getCurrentUser);
router.route("/refresh-token").post(refreshAcessToken);
router.route("/change-password")
        .put(verifyJWT , changeCurrentPasswordValidator() , validate, changeCurrentPassword);
router.route("/get-members")
        .get(verifyJWT , validatePermissionForAcess([Roles.ADMIN, Roles.OWNER, Roles.EMPLOYEE, Roles.MANAGER]), getUser);
router.route("/deactivate/:id")
        .patch(verifyJWT , validatePermissionForAcess([Roles.ADMIN, Roles.OWNER, Roles.MANAGER]), deactivateAccount);

router.route("/username")
    .patch(verifyJWT , changeUsername);

// router.route("/forgot-password").post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
// router.route("/reset-password/:resetToken").post(userForgotPasswordValidator(), validate, resetForgotPassword);

export default router;