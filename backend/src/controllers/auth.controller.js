
import { ApiError } from '../utils/api-error.js'
import {sendMail , emailVerificationMailgenContent} from '../utils/mail.js';
import {asyncHandeler} from '../utils/async-handler.js';
import { ApiResponse } from '../utils/api-response.js';
import { CookieOptions, Roles } from '../utils/constants.js';
import { Tenant } from '../models/tenent.model.js';
import {User} from '../models/user.model.js';
import mongoose from 'mongoose';


export const createHigherRoles = asyncHandeler(async (req, res)=>{

    const {username , email , fullName , password , role, tenantId } = req.body;

    const userExist = await User.findOne({ $or : [{username}, {email}]});

    if(userExist) throw new ApiError(409, `user with ${ adminexist.username === username ? "username" : "email" } already exits`);

    if(role !== Roles.ADMIN)
    {
        if(!tenantId) throw new ApiError(400 , 'tenantId is required');
        const tenant = await Tenant.findById(new mongoose.Types.ObjectId(tenantId));
        if(!tenant) throw new ApiError(400 , 'tenant Organization not found');
    }


    const user = await User.create({
        username ,
        tenantId ,
        email ,
        fullName ,
        password ,
        role,
        isEmailVerified : false,
        createdBy : req.user._id
    });

    if(user && role !== Roles.ADMIN)
    {
        await Tenant.findByIdAndUpdate(tenantId , {$inc :{activeUsers : 1}}, {new : true})
    }

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

    return res.status(200).json(
        new ApiResponse(
            200 ,
            {user :{ profilepic : user.profilepic , username , email ,fullName , role , createdBy: user.createdBy }} ,
            "user created"
        ));
});


export const register = asyncHandeler(async (req,res) => {

    const { tenantId } = req.params;

    const {email , username , fullName , password} = req.body;

    const tenant = await Tenant.findById(new mongoose.Types.ObjectId(tenantId));

    if(!tenant) new ApiError(400 , 'tenant Organization not found');

    const userExist = await User.findOne({ $or : [{username}, {email}]});

    if(userExist) throw new ApiError(409, `user with ${ userExist.username === username ? "username" : "email" } already exits`);

    const user = await User.create({
        username ,
        tenantId : tenant._id,
        email ,
        fullName ,
        password ,
        isEmailVerified : false
    });

    const acessToken = user.generateAcessToken();
    const refreshToken = user.generateRefreshToken();
    const {unhashedtoken , hashedtoken , tokenExpriy} = user.generateTemporaryToken();
        
    user.refreshToken = refreshToken;
    user.emailVerificationExpiry = tokenExpriy;
    user.emailVerificationToken = hashedtoken;

    await user.save({validateBeforeSave: false})

    const url = `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${unhashedtoken}`;

    await sendMail({
        email : user.email,
        subject : 'please verify you email',
        mailgenContent : emailVerificationMailgenContent(user.username, url)
    });

    res.status(200).json(
        new ApiResponse(
            200 ,
            {user :{ profilepic : user.profilepic , username , email ,fullName, role:"user"}, acessToken, refreshToken} ,
            "user created"
        ));
});


export const loginUser = asyncHandeler(async (req , res )=>{

    const {email , username , password} = req.body;

    if(!username && !email) throw new ApiError(400 , 'email or username is required');

    const user = await User.findOne({ $or : [{username}, {email}]});

    if(!user) throw new ApiError(400, 'user not found');

    const isPass = await user.isPasswordCorrect(password);

    if(!isPass) throw new ApiError(400 , 'incorrect password');

    const acessToken = user.generateAcessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;

    await user.save({validateBeforeSave: false});

    const {fullName , role , isEmailVerified , createdBy } = user;

    return res.status(200)
              .cookie("acessToken", acessToken, CookieOptions)
              .cookie("refreshToken", refreshToken, CookieOptions)
              .json(new ApiResponse(
                200,
                {
                    user:{fullName , role , createdBy, isEmailVerified , email:user.email , username: user.username},
                    acessToken,
                    refreshToken
                },
                "user logged in sucessfully"
              ));
});


