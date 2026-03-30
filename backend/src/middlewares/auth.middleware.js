
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandeler } from "../utils/async-handler.js";
import jwt from 'jsonwebtoken';
import { AvailableRoles, RolePermissions} from "../utils/constants.js";

export const verifyJWT = asyncHandeler( async (req , res , next)=>{
    
    const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.acessToken

    if(!token) throw new ApiError(401, "Unauthorized request");

    try {

        const decodeData = jwt.verify(token , process.env.ACESS_TOKEN_SECRET);

        const user = await User.findById(decodeData?._id).select(
                            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry");

        if(!user) throw new ApiError(401 , "Invalid acess token");

        if(!user.isActive) throw new ApiError(401, "please activate your account");

        req.user = user;

        next();

    } catch (error) {
        console.log(error);
        throw new ApiError(401 , "acess token expired");
    }

});

export const checkAllowedToCreateAccount = asyncHandeler(async (req, res, next)=>{

    const user = req.user;

    const { role } = req.body;

    if(!AvailableRoles.includes(role)) throw new ApiError(400, 'not found any suitable role');

    if(!RolePermissions[user.role].includes(role)) throw new ApiError(400, 'not allowed to create this role');

    next();

});


export const validatePermissionForAcess = (roles) => {
    return asyncHandeler(async (req, res , next)=>{
        if(!roles.includes(req.user.role)) throw new ApiError(400 , 'You have no acess this route');
        next();
    });
}