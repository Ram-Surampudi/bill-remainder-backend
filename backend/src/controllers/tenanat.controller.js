
import {asyncHandeler} from '../utils/async-handler.js';
import { ApiResponse } from '../utils/api-response.js';
import {ApiError} from '../utils/api-error.js';
import { Tenant } from '../models/tenent.model.js';
import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { Roles } from '../utils/constants.js';
import { MembershipPlan } from '../models/membershipPlan.model.js';


const keys = ["organizationName" , "founderName" , "slug" , "email" , "pics" , "logo", "contactNumber", "address"];

export const updateIsActiveTenant = asyncHandeler(async (req, res)=>{

    const {id} = req.params;
    const {isActive} = req.body;

    if(typeof isActive !== "boolean") throw new ApiError(400, 'isActive sholud be boolean');

    const data = await Tenant.findByIdAndUpdate(new mongoose.Types.ObjectId(id), {$set:{isActive}});

    if(!data) throw new ApiError(400, "Tenant not found");

    return res.status(200).json(new ApiResponse(200, {}, "sucessfully updated"));

})

export const createTenant = asyncHandeler(async (req, res)=>{

    const {organizationName , description, founderName , slug , email , pics , logo, contactNumber, address} = req.body;

    const tenant = await Tenant.create({
        organizationName ,
        address ,
        contactNumber , 
        email , 
        founderName , 
        description,
        logo , 
        pics , 
        slug , 
        createdBy : req.user._id
    })

    return res.status(200).json(
        new ApiResponse(
            200 ,
            {tenant : tenant } ,
            "tenant created"
        ));
});

export const updateTenant = asyncHandeler( async (req, res)=>{

    const data = req.body;
    const {id} = req.params;
    
    let updateData = {};

    for(let i of keys)
    {
        if(data[i]) updateData[i] = data[i];
    }

    const up = await Tenant.findByIdAndUpdate(id, {$set : updateData}, {new: true});

    return res.status(200).json(
        new ApiResponse(
            200 ,
            {tenant : up } ,
            "tenant updated"
        ));
});

export const deleteTenant = asyncHandeler(async (req , res )=>{

    const {id} = req.params;

    if(!id) throw new ApiError(400, "id parameter required");

    const record = await Tenant.findByIdAndDelete(id);

    if(!record) throw new ApiError(400, "Cann't find tenant with given id")

    return res.status(200).json(new ApiResponse(200,{} , "sucessfully deleted"
    ));

});

export const getDetails = asyncHandeler(async (req, res)=>{

    const {id} = req.params;

    if(!id) throw new ApiError(400, "id parameter required");

    const tenant = await Tenant.findById(new mongoose.Types.ObjectId(id));

    if(!tenant) throw new ApiError(400, "Cann't find tenant with given id");

    const users = await User.find({
            tenantId: id,
            role: { $in: [Roles.OWNER, Roles.MANAGER] },
            isActive: true
        }).select("role profilepic email fullName createdAt");

    const membershipPlans = await MembershipPlan.find({
                tenantId : new mongoose.Types.ObjectId(id),
                isActive : true
            })

    return res.status(200).json(new ApiResponse(200,
        {
            tenant , users , membershipPlans
        },
        "sucessfully fetched data"
    ));
});

export const getAllTenants = asyncHandeler(async (req, res)=>{

    const data = await Tenant.find();

    return res.status(200).json(
    new ApiResponse(
        200 ,
        {tenants : data} ,
        "Tenants data"
    ));
});