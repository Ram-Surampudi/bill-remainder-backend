import mongoose , {Schema} from "mongoose";

const tenantSchema = new Schema(
    {
        organizationName :{
            type : String,
            trim : true,
            required : true,
        },
        founderName : {
            type : String,
            trim : true,
            required : true,
        },
         slug :{
            type : String ,
            required : true,
            unique:true,
            trim : true,
        },
        description :{
            type : String,
            trim : true
        },
        email :{
            type : String,
            unique : true,
            trim : true
        },
        pics :{
            type : Array,
        },
        logo : {
            type : String,
            require : true,
            trim : true
        },
        contactNumber :{
            type : Array,
            required : true,
        },
        address :{
            type : String ,
            required : true,
            trim : true
        },
        isActive :{
            type : Boolean,
            default : true
        },
        activeUsers :{
            type : Number,
            default : 0
        },
        createdBy :{
            type : Schema.Types.ObjectId,
            ref : 'user',
        }
    },
    {
        timestamps : true,
    }
)

export const Tenant = mongoose.model("tenant", tenantSchema)