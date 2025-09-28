const jwt=require('jsonwebtoken')
const userCollection = require('../models/user');// importing user model
require('dotenv').config();
const redisClient = require('../config/redisDb');// importing redis client
async function tokenValidator(req,res,next)
{
   const {token}=req.cookies;
   if(!req.cookies || !req.cookies.token) {
      console.log("No token provided in cookies");
      return res.status(401).json({ message: "No token provided" });
   }
   const payload=jwt.verify(token,process.env.JWT_KEY);// verifying the token using the secret key
   const {_id}= payload;
   if(!_id) {
      return res.status(401).json({ message: "Invalid Token" });
   }
   const result=await userCollection.findById(_id);
   if(!result){
      return res.status(401).json({ message: "User not found" });
   }

   const isBlocked=await redisClient.exists('token:',token);
   if(isBlocked){
      return res.status(401).json({ message: "User Blocked" });
   }
   req.result=result;
   next();// calling the next middleware or route handler
}
module.exports=tokenValidator;// exporting the tokenValidator middleware