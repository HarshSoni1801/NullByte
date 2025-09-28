const express=require('express');
require('dotenv').config();//for reading env file
const app=express();
const main=require('./config/db');
const cookieParser=require('cookie-parser');
const userRouter=require("./routes/userRoutes");
const problemRouter=require("./routes/problemRoutes");
const redisClient = require('./config/redisDb');
const codeSubmissionRouter=require('./routes/codeSubmissionRoutes');
const byteBuddyRouter=require('./routes/byteBuddyRoutes');
const solutionVideoRouter=require('./routes/solutionVideoRoutes');
const cors = require('cors');

app.use(cors({
   origin: 'http://localhost:5173', // Replace with your frontend URL
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





