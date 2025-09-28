const express=require('express');
const router=express.Router();
const {login,register,logout,adminRegister,deleteProfile,guestLogin,updateProfile,getProfile,getActivity,getStats}= require('../RouteFunctions/userRouteFunctions');//importing userRouteFunctions.js\
const profileUpdateLimiter=require('../middlewares/rateLimiter');// a middleware to limit the number of profile update requests
const tokenValidator=require('../middlewares/tokenValidator');// a middleware to validate the token


router.post('/register',register);//this will route to the register function in userAuthFunctions.js
router.post('/admin/register',tokenValidator,adminRegister);
router.post('/login',login);//this will route to the login function in userAuthFunctions.js
router.post('/guest-login', guestLogin);
router.post('/logout',tokenValidator,logout);//this will route to the logout function in userAuthFunctions.js
router.delete('/deleteProfile',tokenValidator,deleteProfile);//this will route to the deleteProfile function in userAuthFunctions.js
router.put('/updateProfile',tokenValidator,profileUpdateLimiter,updateProfile)
router.get('/profile/getStats/:userId',tokenValidator,getStats);
router.get('/profile/getActivity/:userId',tokenValidator,getActivity);
router.get('/profile/:userId',tokenValidator,getProfile);

router.get('/check',tokenValidator,(req,res)=>{ 
   const userData={
      firstName: req.result.firstName,
      emailId: req.result.emailId,
      _id: req.result._id,
      role: req.result.role,
   }
   res.status(200).json({
      user:userData,
      message:`${userData.firstName} is checked successfully`,
   })
});
//this will route to the check function in userAuthFunctions.js
//router.get('/profile',getProfile);//this will route to the getProfile function in userAuthFunctions.js
module.exports=router;