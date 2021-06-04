const express=require('express')
const auth=require('../middleware/auth')
const router=new express.Router()
const User=require('../db/models/users')
const sharp=require('sharp')
const multer=require('multer')

const upload=multer({
    
    limits:{
        fileSize:1048576
    },
    fileFilter(req,file,callback){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        {
            return callback(new Error("Please upload an image file"))
        }
        callback(undefined,true)
    
    }
})
router.post('/user',async (req,res)=>{
    const user=new User(req.body)
    const token=await user.generateAuthToken()
    try{
       await user.save()
       res.status(201).send({user: await user.publicData(),token})
     

   }
   catch(e){
    res.status(400).send(e);
   }
})
router.post("/user/me/avatar",auth,upload.single('avatar'),async(req,res)=>{
    const buffer=await sharp(req.file.buffer).resize(250,250).png().toBuffer()
    req.user.avatar=buffer
    await req.user.save()
    res.send();
},(error,req,res,next)=>{

    res.status(400).send({error:error.message})
})
router.delete("/user/me/avatar",auth,async(req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})
router.get("/users/:id/avatar",async(req,res)=>{
   try
   {
    const user=await User.findById(req.params.id)
   
    if(!user || !user.avatar)
    {
        throw new Error()
    }
    res.set("Content-Type","image/jpg")
    res.send(user.avatar)
}
catch(e)
{
    req.status(404).send()
}
})
router.post("/user/login",async(req,res)=>{
    try{
        const user =await User.findByCredentials(req.body);
        
        const token=await user.generateAuthToken()
       res.send({user:await user.publicData(),token})
    }
    catch(e)
    {
        res.status(400).send();
    }
})
router.post("/user/logout",auth,async(req,res)=>{
   try
   { req.user.tokens=req.user.tokens.filter(token=>{
        token.token!=req.token
    })
    await req.user.save()

    res.send();
}
catch(e)
{
    res.status(500).send()
}
})
router.post("/user/logoutAll",auth,async(req,res)=>{
    try
    { req.user.tokens=[]
     
     await req.user.save()
 
     res.send();
 }
 catch(e)
 {
     res.status(500).send()
 }
 })

router.get('/users/me',auth,async(req,res)=>{

    res.send(req.user)
    
})
router.patch('/user/me',auth,async (req,res)=>{
    const allowedUpdates=['name','email','password','age']
    const userUpdate=Object.keys(req.body)
    let allow=true
    userUpdate.forEach((update)=>{
        allow=allow&&allowedUpdates.includes(update)
    })
    if(!allow)
    {
        return res.status(400).send({error:"Invalid update"})
    }
    try
{
    let user=await User.findById(req.user._id)
    userUpdate.forEach((update)=>{
        user[update]=req.body[update]
    })
    await user.save()
    if(!user)
    {
        return res.status(404).send()
    }
    res.send(user)
}
catch(e)
{
    res.status(400).send(e)
}   
})

router.delete('/user/me',auth,async(req,res)=>{

    try 
    {
        await req.user.remove()
       
        
        res.send({user: await req.user.publicData()})
    }

    catch(e)
    {
        res.status(400).send(e)
    }
})


module.exports=router