const express=require('express');
const router=express.Router();
const tokenValidator=require('../middlewares/tokenValidator');// a middleware to validate the token
const {submitCode,runCode}=require('../RouteFunctions/codeSubmissionRouteFunctions');// importing the function from the codeSubmissionRouteFunctions file

router.post("/:id",tokenValidator,submitCode);
router.post("/run/:id",tokenValidator,runCode);

module.exports=router;