const mongoose = require("mongoose"),
  express = require("express"),
  router = express.Router();

mongoose.connect("mongodb://localhost:27017/micamens")
.then(() => {
  console.log("Auth model connected")
})
.catch(err => {
  console.log("Auth model connection error: " + err)

});

const sCred = new mongoose.Schema(
  {
      userE: {
        type: String,
        required: [true, "Username required"]
      },
      passW: {
        type: String,
        required: [true, "Password required"]
      }
  }
);

const dCred = mongoose.model("Cred",sCred);

const bcrypt = require ('bcrypt');

router.post("/signup", async (req,res) => {

  console.log("Entering /models/auth/signup");
  
  if (await signup(req.body)) {
    console.log("Successfully called /models/auth/signup/user/signup function");
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send({msg: "Signed up"});
  } else {
    console.log("Failed calling /models/auth/signup/user/signup function");
    res.status(500).send({msg: "Sign up failed"});
  }
}
)

router.post("/signin", async (req,res) => {
  if (await signin(req.body)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send({msg: "Signed in"});
  } else {
    res.status(500).send({msg: "Signin failed"});
  }
  }
)

async function signup(cred) {
  console.log("Entering /models/auth/signup/user/signup function");
  try {
    const hashPW = await bcrypt.hash(cred.password,12);
    console.log("Calling /models/auth/signup/user/signup/dCred");
    let lCredSaveResult = await new dCred({
      userE: cred.email,
      passW: hashPW
    }).save();
    console.log("Called /models/auth/signup/user/signup/dCred");
    return true
  }
  catch (err) {
    console.log("Error in /models/auth/signup/user",cred.email, ": ", err);
    return false;
  }
}

async function signin(cred) {
  try {
    let lCredFindResult = await dCred.findOne(
      {
        userE : cred.email
      }
    )
    let validPW = await bcrypt.compare(cred.password, lCredFindResult.passW)
    if (validPW) {
      return true;
    } else
    {
      throw new Error({msg: "Signin failed"});
    }
  }
  catch (err) {
    console.log("Error in /models/auth/signin/user",cred.email, ": ", err);
    return false;
  }
}

module.exports = router;