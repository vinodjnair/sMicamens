var mongoose = require("mongoose");
let dbConnect = false;
mongoose.connect("mongodb://127.0.0.1:27017/micamens")
.then(() => {
  console.log("Activity model connected")
  dbConnect = true;
})
.catch(err => {
  console.log("Activity model connection error: " + err)
});

let sSpace = new mongoose.Schema(
  {
      cID: String,
      space: String,
      lastActiveDate: Date,
      createdDate: Date,
  }
);

let mSpace = mongoose.model("Space",sSpace);

async function enrichSpace (aggActivities) {

  let i=0;
  let lSpace = [];

  for (let lAggActivityResult of aggActivities) {
    try {
      lSpace = await mSpace.find({
        $and:[
          {cID: lAggActivityResult._id.cID},{space: lAggActivityResult._id.space}
        ]
      });
      if(lSpace.length != 0) {
        lAggActivityResult.lastSpaceActivityDate = lSpace[0].lastActiveDate;
      } else {
        // Test how a null space data behaves in sorting.
      }
      return true;
    }
    catch(err) {
      console.log("Error in /models/space/enrichSpace/",cID,": ", err);
      return false;
    }
  }
}

async function updateSpace(task) {
  try {
    let lupdSpaceResult =  await mSpace.updateOne(
      {$and: [{cID: task.cID},{space:task.space}]},        
      {
        lastActiveDate: task.lastActiveDate,
        createdDate: task.createdDate
      },
      { upsert: true }
    )
    return true;
  }
  catch {
    console.log("Error in /models/space/updateSpace/",cID,": ", err);
    return false;
  }
}

  module.exports = {enrichSpace, updateSpace,dbConnect};