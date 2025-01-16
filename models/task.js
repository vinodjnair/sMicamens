let mongoose = require("mongoose"),
  express = require("express"),
  router = express.Router();
  
const {updateActivity}  = require("./activity");
const {updateSpace}  = require("./space");


/* mongoose.connect("mongodb://localhost:27017/micamens")
  .then(() => {
    console.log("Task model connected in the new server")
  })
  .catch(err => {
    console.log("Task model connection error: " + err)
  }); */

let sTask = new mongoose.Schema(
  {
    cID: String,      
    name: String,
    space: String,
    category: String,
    notes: String,
    completed: Boolean,
    lastActiveDate: Date,
    lastActiveDateFormatted: Date,
    lastActiveDateTimeSpent: Number,
    createdDate: Date
  }
);

let mTask = mongoose.model('Task', sTask );

let aTask = [];
let lNewTaskId;

router.get("/:cID", async (req,res) => {
  const cID = req.params.cID;
  try {
    let aTask = await mTask.find({cID : cID})
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(aTask);  // Serializes for transmission and sets the content type implicitly.
  }
  catch (err) {
    console.log(err);   // Not handled properly.
    res.status(500).end();    //send() is an abstraction on end().
  }
})

router.post("/", async (req,res) => {
  console.log(__filename + "\post\aTask: ", req.body);
  lNewTaskId = null;
  if(await updateActivity(req.body)) {
    if(await updateTask(req.body, req.headers)) {
      if (await updateSpace(req.body)) {

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(
          {
            taskId: lNewTaskId,
            msg: "Update task success in model/task/updateSpace"
          });
      } else {
        res.status(500).json({msg: "Update task failed in model/task/updateSpace"});
      }
    } else {
      res.status(500).json({msg: "Update task failed in model/task/updateSpace"});
    }
  } else {
      res.status(500).json({msg: "Update task failed in model/task/updateSpace"});
  }
}
)

async function updateTask(task, pHeader) {
  
  try {
    
    let lCompleted = (task["completed"]) ? true : false;

    let lUpdTaskResult;

    if (task["taskId"]) {
      lUpdTaskResult = await mTask.updateOne(
        {_id : task.taskId},      
        {
          name: task.name,
          space: task.space,
          category: task.category,
          notes: task.notes,
          lastActiveDate: Date.now(),
          lastActiveDateFormatted: new Date(new Date().toDateString()),
          lastActiveDateTimeSpent: task.timeSpentToday,
          completed: lCompleted
        }
      )
    } else { 
      lUpdTaskResult = await mTask.create(     
        {
          cID: pHeader['cid'],
          name: task.name,
          space: task.space,
          category: task.category,
          notes: task.notes,
          lastActiveDate: Date.now(),
          lastActiveDateFormatted: new Date(new Date().toDateString()),
          lastActiveDateTimeSpent: task.timeSpentToday,
          completed: lCompleted,
          createdDate: Date.now()
        }
      )
    }
    console.log(__filename + "\ updateTask\lUpdTaskResult: ", lUpdTaskResult);
    lNewTaskId = lUpdTaskResult._id
    return true
  }
  catch (err) {
    console.log("Error in " + __filename + "\ updateTask: ", err);
    return false;
  }
}
module.exports = router;
