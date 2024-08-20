const mongoose = require("mongoose"),
  express = require("express"),
  router = express.Router();

mongoose.connect("mongodb://0.0.0.0:27017/micamens")
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
  if (await signup(req.body)) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send({msg: "Signed up"});
  } else {
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
  try {
    const hashPW = await bcrypt.hash(cred.password,12);
    let lCredSaveResult = await new dCred({
      userE: cred.email,
      passW: hashPW
    }).save();
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