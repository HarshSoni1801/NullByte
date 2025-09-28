const userCollection = require('../models/user');
const validate=require("../utils/passwordValidators")// a validtor function to validate user input
const bcrypt=  require('bcrypt');// a library to hash passwords
const jwt= require('jsonwebtoken');// a library to create and verify JWT tokens
const redisClient = require('../config/redisDb');// importing redis client to check if the user is blocked 
const mongoose = require('mongoose'); // ADD THIS LINE
const register = async (req, res) => {
  try {
    console.log("register function called");
    validate(req.body);
    console.log("After validate");
    const { emailId, password } = req.body;
    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = 'user';
    
    const user = await userCollection.create(req.body);
    
    const userData = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    }
    
    const token = jwt.sign({ _id: user._id, emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 * 24 * 30 });
    
    res.cookie('token', token, {
  maxAge: 1000 * 60 * 60 * 24 * 30,
  httpOnly: true,
  secure: 'true', // Only HTTPS in production
  sameSite: 'none',
});
    res.status(200).json({
      user: userData,
      message: "User created successfully",
    });
  } catch (err) {
    console.log("Error in register:", err);
    
    const errorResponse = {
      success: false,
      message: err.message || "Validation failed",
      errors: {}
    };
  
    // For password validation error, make it field-specific
    if (err.message && err.message.includes('Password must be strong')) {
      errorResponse.errors = {
        password: err.message
      };
      errorResponse.message = "Validation failed"; // General message
    }
    
    // For email validation error
    if (err.message && err.message.includes('Invalid email format')) {
      errorResponse.errors = {
        emailId: err.message
      };
      errorResponse.message = "Validation failed";
    }
    
    // For missing fields
    if (err.message && err.message.includes('Mandatory fields are missing')) {
      errorResponse.message = err.message;
    }
  
    res.status(400).json(errorResponse);
  }
};
const adminRegister=async (req,res)=>{
   try{
      if(req.result.role!='admin')// checking if the user is an admin
         return res.status(403).send("Access denied: Admins only");
      validate(req.body);
      const {emailId,password}=req.body;
      req.body.password=await bcrypt.hash(password,10)// hashing the password before saving it to the database with 10 iterations
      req.body.role='admin';// setting the default role to user
      const {role}=req.body

      const user=await userCollection.create(req.body);// this will create a new user in the database
      const token=jwt.sign({_id:user._id,emailId,role},process.env.JWT_KEY,{expiresIn:60*60*24*30})// creating a JWT token with 1 hour expiration time and signing it with a secret key
    res.cookie('token', token, {
  maxAge: 1000 * 60 * 60 * 24 * 30,
  httpOnly: true,
  secure: 'true', // Only HTTPS in production
  sameSite: 'none',
});
      res.status(201).send("User registered successfully")// sending the response with the user details and token
   }
   catch(err){
      res.status(400).send("Error: "+err)
   }

}
const login=async (req,res)=>{
   try{
      const {emailId,password}=req.body;
      if(!emailId)
         throw new Error('Email ID is required');
      if(!password)
         throw new Error('Password is required');
      const user=await userCollection.findOne({emailId})
      if(!user)
         throw new Error('User not found');
      const match=await bcrypt.compare(password,user.password)
      if(!match)
         throw new Error('Invalid password');
      const userData={
         firstName:user.firstName,
         emailId:user.emailId,
         _id: user._id,
         role: user.role, // Include the role in the user data
      }
      const token=jwt.sign({_id:user._id,emailId},process.env.JWT_KEY,{expiresIn:60*60*24*30})// creating a JWT token with 30 days expiration time and signing it with a secret key
    res.cookie('token', token, {
  maxAge: 1000 * 60 * 60 * 24 * 30,
  httpOnly: true,
  secure: 'true', // Only HTTPS in production
  sameSite: 'none',
});
      res.status(200).json({
         user: userData, // sending the user data in the response
         message: "User logged in successfully",
      })

   }
   catch(err){
      return res.status(401).send("Error: "+err.message);
   }
}
const logout=async (req,res)=>{
   try{
         const {token}=req.cookies;
         const payload=jwt.decode(token);
         await redisClient.set('token:'+token,'blocked'); // blocking the user by setting a key in Redis
         await redisClient.expireAt('token:'+token,payload.exp);// setting the token to expire in 1 hour
         res.cookie('token', token, {
  maxAge: 0,
  httpOnly: true,
  secure: 'true', // Only HTTPS in production
  sameSite: 'none',
});
         res.send("User logged out successfully");
   }
   catch(err){
      return res.status(401).send("Error: "+err.message);
   }
}
const deleteProfile=async (req,res)=>{
   try{
      const userId=req.result._id;
      userCollection.findByIdAndDelete(userId);
   }
   catch(err){
      return res.status(401).send("Error while deleting user: "+err.message);
   }
}
const crypto = require('crypto'); // for random guest info

const guestLogin = async (req, res) => {
  try {
    // Generate a unique guest email
    const guestEmail = `guest_${crypto.randomBytes(5).toString('hex')}@nullbyte.guest`;
    const guestPassword = crypto.randomBytes(10).toString('hex');
    
    // Hash the guest password before saving
    const hashedPassword = await bcrypt.hash(guestPassword, 10);

    // Create guest user with minimal required info
    const guestUser = await userCollection.create({
      firstName: 'Guest',
      lastName: 'User',
      emailId: guestEmail,
      password: hashedPassword,
      role: 'user',
    });

    // Prepare user data for response (do not send password)
    const userData = {
      firstName: guestUser.firstName,
      emailId: guestUser.emailId,
      _id: guestUser._id,
      role: guestUser.role,
    };

    // Create JWT token for guest user
    const token = jwt.sign(
      { _id: guestUser._id, emailId: guestUser.emailId, role: guestUser.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 * 24 * 30 } // 30 days
    );

    // Set token cookie
    res.cookie('token', token, {
  maxAge: 1000 * 60 * 60 * 24 * 30,
  httpOnly: true,
  secure: 'true', // Only HTTPS in production
  sameSite: 'none',
});

    return res.status(200).json({
      user: userData,
      message: 'Guest login successful',
    });

  } catch (err) {
    return res.status(500).json({ message: 'Guest login failed', error: err.message });
  }
};

const updateProfile = async (req, res) => {
   try {
       const userId = req.result._id;
       const { 
           firstName, 
           lastName, 
           emailId, 
           gender, 
           avatarUrl, 
           about, 
           socialLinks,
           languagePreference
       } = req.body;
       console.log("Update Profile Body:", req.body);
       const updatedUser = await userCollection.findByIdAndUpdate(
           userId,
           { 
               firstName,
               lastName,
               emailId,
               gender, 
               avatarUrl, 
               about, 
               socialLinks,
                languagePreference 
           },
           { new: true, runValidators: true }
       );

       if (!updatedUser) {
           return res.status(404).json({ message: "User not found" });
       }

       res.status(200).json({
           user: updatedUser,
           message: "Profile updated successfully"
       });
   } catch (error) {
       // A common error to catch here is a duplicate email
       if (error.code === 11000) {
           return res.status(400).json({ message: "Email is already in use." });
       }
       res.status(500).json({ message: "Error updating profile", error: error.message });
   }
};
const getProfile = async (req, res) => {
   try {
       const userId = req.params.userId;
       if (!userId) {
           return res.status(400).json({ message: "User ID is required" });
       }
       // Fetch the user data from the database
       const user = await userCollection.findById(userId).select('role firstName lastName emailId problemSolved gender about socialLinks languagePreference avatarUrl createdAt');
       if (!user) {
           return res.status(404).json({ message: "User not found" });
       }
       res.status(200).json({ user });
   } catch (error) {
       res.status(500).json({ message: "Internal server error", error: error.message });
   }
};
const getStats = async (req, res) => {
   try {
     const userId = req.params.userId;
     
     const user = await userCollection.findById(userId)
       .populate({
         path: 'problemSolved',
         select: 'difficulty'
       });
 
     if (!user) {
       return res.status(404).json({ message: "User not found" });
     }
 
     // Calculate stats by difficulty
     let easySolved = 0;
     let mediumSolved = 0;
     let hardSolved = 0;
     
     user.problemSolved.forEach(problem => {
       if (problem.difficulty === 'easy') easySolved++;
       else if (problem.difficulty === 'medium') mediumSolved++;
       else if (problem.difficulty === 'hard') hardSolved++;
     });
 
     const totalSolved = user.problemSolved.length;
 
     const recentSubmission = await mongoose.model('problemSubmission')
       .findOne({ userId: userId })  // ✅ Lowercase u
       .sort({ createdAt: -1 })
       .populate('problemId', 'title')
       .select('problemId language createdAt')
       .lean();// ← Returns plain JS object instead of Mongoose document
      console.log("Recent Submission:", recentSubmission);

     const totalSubmissions = await mongoose.model('problemSubmission')
       .countDocuments({ userId: userId });  // ✅ Lowercase u
 
     const stats = {
       totalSolved,
       easySolved,
       mediumSolved,
       hardSolved,
       totalSubmissions,
       recentSubmission: recentSubmission ? {
         problemName: recentSubmission.problemId?.title || 'Unknown Problem',
         language: recentSubmission.language || 'Unknown',
         timestamp: recentSubmission.createdAt
       } : null
     };
 
     res.status(200).json(stats);
   } catch (error) {
     console.error("Error fetching stats:", error);
     res.status(500).json({ message: "Error fetching stats", error: error.message });
   }
 };
const getActivity = async (req, res) => {
   try {
     const userId = req.params.userId;
     
     const thirtyDaysAgo = new Date();
     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
     thirtyDaysAgo.setHours(0, 0, 0, 0);
 
     const activityData = await mongoose.model('problemSubmission').aggregate([  
      //It uses a pipeline approach where documents pass through multiple stages, each transforming the data in some way.
       {
         $match: {
           userId: new mongoose.Types.ObjectId(userId),  // ✅ CORRECTED: lowercase u
           createdAt: { $gte: thirtyDaysAgo }
         }
       },
       {
         $group: {
          //Groups by: Date (ignoring time), counts submissions per date
           _id: {
             $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
           },
           count: { $sum: 1 }
         }
       },
       {
         $sort: { _id: 1 }
       }
     ]);
 
     const activity = activityData.map(day => ({
       date: day._id,
       count: day.count
     }));
 
     res.status(200).json({ activity });
   } catch (error) {
     console.error("Error fetching activity:", error);
     res.status(500).json({ message: "Error fetching activity", error: error.message });
   }
 };
module.exports = { register, login, logout, adminRegister, deleteProfile, guestLogin, updateProfile, getProfile, getStats, getActivity };
// exporting the functions to be used in the userRoutes.js file
