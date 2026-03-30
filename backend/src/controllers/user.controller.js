import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandeler } from "../utils/async-handler.js";
import { CookieOptions, RolePermissions, Roles } from "../utils/constants.js";
import crypto from 'crypto';
import { emailVerificationMailgenContent, forgetPasswordMailgenContent, sendMail } from "../utils/mail.js";
import { ApiResponse } from "../utils/api-response.js";
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';


export const setActiveState = asyncHandeler(async (req, res)=>{

    const user = req.user;
    const {id} = req.params;
    const { isActive } = req.body;

    const record = await User.findById(new mongoose.Types.ObjectId(id));

    if(!record) throw new ApiError(400, "user not found");

    if(id === user._id || ([Roles.OWNER , Roles.MANAGER].includes(user.role) && user.tenantId === record.tenantId))
    {
        await User.findByIdAndUpdate(record._id, {$set : {isActive}}, {new : true});
    }
    else throw new ApiError(400, "your are not allowed do changes");

    return res.status(200).json(new ApiResponse(200,
        {},
        "sucessfully updated"
    ));
})

export const deactivateAccount = asyncHandeler(async (req, res)=>{

    const currentUser = req.user;
    const {id} = req.params;
    const {isActive} = req.body;

    const user = await User.findById(new mongoose.Types.ObjectId(id));

    if(!user) throw new ApiError(400, "cann't find user");

    if(!RolePermissions[currentUser.role].includes(user.role)) throw new ApiError(400, "you have no access");

    await User.findByIdAndUpdate(new mongoose.Types.ObjectId(id), {$set:{isActive}});

    return res.status(200).json(new ApiResponse(200, {}, "successfully updated"));
});

export const changeUsername = asyncHandeler(async (req, res)=>{

    const {username} = req.body;
    const user = await User.findOne({username});

    if(user) throw new ApiError(400, "username already exits");

    await User.findByIdAndUpdate(req.user._id, {$set:{username}});

    return res.status(200).json(new ApiResponse(200, {}, "successfully updated"));
});



export const logout = asyncHandeler(async (req, res )=>{

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : ""
            }
        },{new : true});

    return res.status(200)
            .clearCookie("acessToken", CookieOptions)
            .clearCookie("refreshToken", CookieOptions)
            .json(
                new ApiResponse(200 , {}, "user logged out")
            );
});

export const changeCurrentPassword = asyncHandeler( async (req, res)=>{

    const {oldPassword , newPassword} = req.body;

    const user = await User.findById(req.user._id);

    const isPassVaild = await user.isPasswordCorrect(oldPassword);

    if(!isPassVaild) throw new ApiError(400 , 'old password is incorrect');

    user.password = newPassword;

    await user.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(
        200 ,
        {},
        "password has been changed"
    ));

});


export const verifyEmail = asyncHandeler(async (req, res)=>{
    const {verificationToken} = req.params;

    if(!verificationToken) throw new ApiError(400 , "email verification token is required");

    let hashedtoken = crypto.createHash('sha256')
                            .update(verificationToken)
                            .digest("hex");

    const user = await User.findOne({
        emailVerificationToken:hashedtoken,
        emailVerificationExpiry : {$gt : Date.now()}
    });

    if(!user) throw new ApiError(400 , "Token is invalid or expired");

    user.isEmailVerified = true;
    user.emailVerificationExpiry = undefined;
    user.emailVerificationToken = undefined;

    await user.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(
        200,
        {
            emailVerified: true
        },
        "email verified sucessfully"
    ));
});



export const resendEmail = asyncHandeler(async (req, res)=>{

    const user = await User.findById(new mongoose.Types.ObjectId(req.user._id));

    if(!user) throw new ApiError("user does not exits");

    if(user.isEmailVerified) throw new ApiError("user already verified");

    const {unhashedtoken , hashedtoken , tokenExpriy} = user.generateTemporaryToken();
     
    user.emailVerificationExpiry = tokenExpriy;
    user.emailVerificationToken = hashedtoken;

    await user.save({validateBeforeSave: false})

    const url = `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${unhashedtoken}`;

    await sendMail({
        email : user.email,
        subject : 'please verify you email',
        mailgenContent : emailVerificationMailgenContent(user.username, url)
    });

    return res.status(200).json(new ApiResponse(
        200 ,
        {},
        "mail has been sent"
    ));

});

export const forgotPasswordRequest = asyncHandeler( async (req, res)=>{

    const {email} = req.body;

    const user = await User.findOne({email});
    
    if(!user) throw new ApiError(404 , 'user not found');

    const {unhashedtoken , hashedtoken , tokenExpriy} = user.generateTemporaryToken();

    user.forgotPasswordExpiry = tokenExpriy;
    user.forgotPasswordToken = hashedtoken;

    await user.save({validateBeforeSave: false});

    const url = `${process.env.FORGOT_PASSWORD_URL}/${unhashedtoken}`;

    await sendMail({
        email : user.email,
        subject : 'Password reset request',
        mailgenContent : forgetPasswordMailgenContent(user.username, url)
    });

    return res.status(200).json(new ApiResponse(
        200 ,
        {},
        "mail has been sent"
    ));
});

export const resetForgotPassword = asyncHandeler( async (req, res)=>{

    const {resetToken} = req.params;

    const {newPassword} = req.body; 

    let hashedtoken = crypto.createHash('sha256')
                            .update(resetToken)
                            .digest("hex");

    const user = await User.findOne({
        forgotPasswordToken:hashedtoken,
        forgotPasswordExpiry : {$gt : Date.now()}
    });

    if(!user) throw new ApiError(489 , "Token is invalid or expired");

    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    user.password = newPassword;

    await user.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(
        200 ,
        {},
        "password resetted sucessfully"
    ));
});

export const refreshAcessToken = asyncHandeler( async (req, res)=>{

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    console.log(incomingRefreshToken);
    

    if(!incomingRefreshToken) throw new ApiError(400 , "Unauthorized access");

    try {
        const decodedData = await jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET);
        console.log(decodedData + "decoded");
        
        const user = await User.findById(decodedData?._id);

        console.log(user);
        

        if(!user) throw new ApiError(400 , 'invalid refresh token');

        if(user.refreshToken !== incomingRefreshToken) throw new ApiError(400 , 'refresh token expired');

        const acessToken = user.generateAcessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;

        await user.save({validateBeforeSave: false});
        
        return res.status(200)
                  .cookie("acessToken", acessToken , CookieOptions)
                  .cookie("refreshToken", refreshToken , CookieOptions)
                  .json(new ApiResponse(
                    200 ,
                    {acessToken , refreshToken},
                    "Acess token refreshed"
                  ));

    } catch (error) {
        console.log(error);
        
        throw new ApiError(400 , 'invalid refresh token');
    }
});


export const getUser = asyncHandeler(async (req, res)=>{

    const user = req.user;

    const users = await User.find({
        tenantId : user.tenantId,
        role : {$in:RolePermissions[user.role]}
    }).select("profilepic username email fullName role isActive");

    return res.status(200).json(new ApiResponse(
        200,
        {users},
        "sucessfully fetched users"
    ));
});


export const getCurrentUser = asyncHandeler(async (req, res)=>{
    return res.status(200).json(new ApiResponse(200, {
        user : req.user
        },
        "successfully fetched"
    ));
})