const mongoose=require('mongoose')
const Task=require('./tasks')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new Error("Please enter a valid email")
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:7,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes("password"))
            {
                throw new Error("Password should not contain the string password")
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0)
            {
                throw new Error("Please enter a valid age")
            }
        }
    },
    avatar:{
        type:Buffer,
    },
    tokens:[
        {
            token:{
            type:String,
            required:true,
          
            }
        }
    ]
},{
    timestamps:true
})
userSchema.virtual('tasks',{
ref:"Task",
localField:"_id",
foreignField:"owner"
})
userSchema.methods.publicData=async function(){
    
    const user=this.toObject()
delete user.password
delete user.tokens
delete user.avatar
    return user
}
userSchema.methods.generateAuthToken=async function(){
    const user=this;
    const token=await jwt.sign({id:user.id.toString()},process.env.JWT_SECRET_KEY)
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token;
}

userSchema.statics.findByCredentials=async function({email,password}){
const user=await User.findOne({email:email})
if(!user)
{
    throw new Error("Unable to Login")
}
const isMatch=await bcrypt.compare(password,user.password)
if(!isMatch)
{
    throw new Error("Unable to Login")
}

return user;

}
userSchema.pre('save',async function(next){
    const user =this
  if(user.isModified('password'))
  {
      user.password=await bcrypt.hash(user.password,8)
  }
    next()

})
userSchema.pre('remove',async function(next){
const user=this;
await Task.deleteMany({owner:user._id})


next()
})
const User=mongoose.model("User",userSchema)
module.exports=User