const express=require('express');
require('dotenv').config();//for reading env file
const app=express();
const main=require('./src/config/db');
const cookieParser=require('cookie-parser');
const userRouter=require("./src/routes/userRoutes");
const problemRouter=require("./src/routes/problemRoutes");
const redisClient = require('./src/config/redisDb');
const codeSubmissionRouter=require('./src/routes/codeSubmissionRoutes');
const byteBuddyRouter=require('./src/routes/byteBuddyRoutes');
const solutionVideoRouter=require('./src/routes/solutionVideoRoutes');
const cors = require('cors');

app.use(cors({
     origin: [
    "http://localhost:5173",  // Keep for development
    "https://nullbyte-frontend.onrender.com"  // Add production URL
  ], // Replace with your frontend URL
   credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}))
app.use(express.json());//Convert incoming JSON requests to JavaScript objects
app.use(cookieParser());//parses the Cookie header and makes the cookies available as an object on req.cookies
app.use('/user',userRouter);//mounts the userAuth router on the /user path
app.use('/problem',problemRouter);
app.use('/submit',codeSubmissionRouter);//mounts the codeSubmission router on the /codeSubmission path
app.use('/byteBuddy',byteBuddyRouter);
app.use('/solutionVideo',solutionVideoRouter);

async function initializeConnections(){
   try{
      await Promise.all([main(),redisClient.connect()]);// connect to both MongoDB and Redis
      console.log('Database and Redis connections established successfully');
      app.listen(process.env.PORT,()=>{
         console.log(`Server is running on port ${process.env.PORT}`);
      })
   }
   catch(err){
      console.error('Error initializing connections:', err);
   }
}
initializeConnections();





