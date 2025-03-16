let mongoose = require("mongoose"),
  express = require("express"),
  router = express.Router();

const {enrichSpace, dbConnect}  = require("./space");

if (dbConnect) {
  mongoose.connect("mongodb://127.0.0.1:27017/micamens")
  .then(() => {
    console.log("Activity model connected in the new server")
  })
  .catch(err => {
    console.log("Activity model connection error: " + err)
  });
}

let sActivity = new mongoose.Schema(
  {
      taskId: String,
      cID: String,
      notes: String,
      activityDate: Date,
      activityDateFormatted: Date,
      timeSpent: Number,
      createdDate: Date
  }
);

let mActivity = mongoose.model("Activity",sActivity);

let lAggActivityResult = [];

router.get("/:cID/summary", async (req,resp) => {
  const cID = req.params.cID;
  resp.setHeader('Content-Type', 'application/json');
  if (await aggregateActivity(cID)){       
    if (await enrichSpace(lAggActivityResult)) {
      resp.status(200).json(lAggActivityResult);
    } else {
      resp.status(500).send("Summary aggregation failed in model/activity"); 
    }
  } else {
    resp.status(500).send("Summary aggregation failed in model/activity"); 
  }  
}
)

async function aggregateActivity (cID)
  {

    try {
      lAggActivityResult = await mActivity.aggregate(
        [            
            { 
              $match: { cID: cID}
            }, 
            {
              $project:
              { 
                activityTaskID: {$toObjectId:"$taskId"},       //Todo Can this be eliminated?
                activityDate:1,
                timeSpent:1
              }
            },
            {
              $lookup: {from: "tasks",localField: "activityTaskID",foreignField: "_id",as: "tasks"}
            },
            {
              $group: { 
                _id: 
                {
                  cID: cID,
                  space: { $arrayElemAt: ["$tasks.space",0]},
                  category: { $arrayElemAt: ["$tasks.category",0]}
                },
                  timeSpent: { $sum: "$timeSpent" },
                  lastCategoryActivityDate : {$max: "$activityDate"}
                  } 
            }
        ]
      )
      return true;
    }
    catch (err) {
      console.log("Error in /models/activity/aggregateActivity/",cID,": ", err);
      return false;
    }
}

async function updateActivity(activity) {

  const cLastActiveDateFormatted = new Date(new Date().toDateString());

  try{
    let lUpdActivityResult = await mActivity.updateOne(
      {$and: [{taskId: activity.taskId},{activityDateFormatted:cLastActiveDateFormatted}]},        
      {
        notes: activity.notes,
        cID: activity.cID,
        activityDate: activity.lastActiveDate,
        activityDateFormatted: cLastActiveDateFormatted,
        timeSpent: activity.timeSpentToday,
        createdDate: Date.now()
      },
      { upsert: true }
    )
    return true
  }
  catch(err) {
    console.log("Error in /models/activity/updateActivity/ ",activity.cID,"/", activity.taskId,": ", err);
    return false;
  }
  }

module.exports = {router, updateActivity};
