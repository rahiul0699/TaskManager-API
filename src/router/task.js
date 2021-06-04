const express=require('express')
const router=new express.Router()
const auth=require('../middleware/auth')
const Task=require('../db/models/tasks')
router.post('/task',auth,async (req,res)=>{
    // const task=new Task(req.body)
    const task=new Task({
        ...req.body,
        owner:req.user._id
    })
    try 
    {
        await task.save()
        res.status(201).send(task)
    }
   catch(e)
   {
    res.status(400).send(e)
   }
    
})
// sort limit skip
router.get('/tasks',auth,async(req,res)=>{
    // console.log(req.query);
    let sortBy={

    }
    let findQuery={owner:req.user._id}
    if(req.query.completed)
    {
        findQuery["completed"]=req.query.completed==='true'
    }
    if(req.query.sortBy)
    {
        let a=req.query.sortBy.split(":");
        sortBy[a[0]]=a[1]
    }
    

    try 
    {
        const tasks=await Task.find(findQuery,null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort:sortBy
        })
        res.send(tasks)
    }
    catch (e)
    {
        res.status(500).send();
    }
  
})
router.get('/task/:id',auth,async (req,res)=>{
    try 
    {
        const task=await Task.findOne({_id:req.params.id,owner:req.user._id})
        if(!task)
        {
            return res.status(404).send()
        }
        res.send(task)


    }
    catch (e)
    {
        res.status(500).send(e);
    }
   
})

router.patch('/task/:id',auth,async (req,res)=>{
    const allowedUpdates=['description','completed']
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
    let task=await Task.findOne({_id:req.params.id,owner:req.user._id})
   
    userUpdate.forEach((update)=>{
        task[update]=req.body[update]
    })
    await task.save()
    if(!task)
    {
        return res.status(404).send()
    }
    res.send(task)
}
catch(e)
{
    res.status(400).send(e)
}   
})

router.delete('/task/:id',auth,async(req,res)=>{

    try 
    {
        const task=await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!task)
        {
            return res.status(404).send()
        }
        res.send(task)
    }

    catch(e)
    {
        res.status(400).send(e)
    }
})

module.exports=router