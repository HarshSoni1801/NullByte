const express=require('express');
const router=express.Router();
const tokenValidator=require('../middlewares/tokenValidator');// a middleware to validate the token
const solveDoubt=require('../RouteFunctions/byteBuddyRouteFunctions');
console.log("In byteBuddyRoutes.js");
router.post('/chat',tokenValidator,solveDoubt);
module.exports=router;