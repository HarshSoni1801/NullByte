const cloudinary = require('cloudinary').v2
require('dotenv').config()
const problemCollection=require('../models/problemSchema');
const solutionVideoCollection=require('../models/solutionVideoSchema');

cloudinary.config({ //configuring cloudinary with the credentials from the .env file
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generateUploadSignature=async (req,res)=>{
   if(req.result.role!='admin')// checking if the user is an admin
      return res.status(403).send("Access denied: Admins only");
   try{
      console.log("Generating upload signature");
      const {problemId}=req.params;
      const findProblem=await problemCollection.findById(problemId); // checking if the problem exists in the database
      if(!findProblem)
         return res.status(404).send("Problem not found");
   
      const timestamp=Math.round((new Date()).getTime()/1000);// generating a timestamp for the signature
      const public_id=`NullByte_solution_videos/${problemId}/${timestamp}`;// generating a public id for the video

      const uploadParams={timestamp,public_id} //these wil be hashed to generate the signature and then at the server end the same parameters will be used to verify the signature
      console.log("before generating signature");
      const signature=cloudinary.utils.api_sign_request( // generating the signature using cloudinary's api_sign_request method
         uploadParams,
         process.env.CLOUDINARY_API_SECRET
      )
      console.log("After generating signature");
      res.json({
         signature,
         timestamp,
         public_id,
         api_key: process.env.CLOUDINARY_API_KEY,
         cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
         upload_url:`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`
      })
   }
   catch(err)
   {
      res.status(500).send("Error generating upload signature: "+err.message)
   }
}
const saveVideoMetaData= async(req,res)=>{
   if(req.result.role!='admin')// checking if the user is an admin
      return res.status(403).send("Access denied: Admins only");
   try{
      console.log("Saving video metadata");
      const {
         problemId,
         cloudinaryPublicId,
         secureUrl,
         duration,
      }=req.body;
      const userId=req.result._id;

      const cloudinaryResource=await cloudinary.api.resource( //verifying if the video is properly uploaded and exists in cloudinary
         cloudinaryPublicId,
         {resource_type: 'video'}
      )
      if(!cloudinaryResource)
         return res.status(400).send("Video not found in cloudinary");

      const isExisting=await solutionVideoCollection.findOne({problemId,userId,cloudinaryPublicId}); // checking if the video metadata already exists in the database
      if(isExisting)
         return res.status(400).send("Video metadata already exists");

      const thumbnailUrl=cloudinary.image(cloudinaryPublicId,{resource_type:"video"})// generating a thumbnail url for the video
      const videoMetaData=await  solutionVideoCollection.create({ // saving the video metadata to the database
         problemId,
         userId,
         cloudinaryPublicId,
         secureUrl,
         thumbnailUrl,
         duration:cloudinaryResource.duration || duration
      })
      res.status(201).json({message:"Video metadata saved successfully",
         videoSolution:{
            id:videoMetaData._id,
            problemId:videoMetaData.problemId,
            duration:videoMetaData.duration,
            uploadedAt:videoMetaData.createdAt,
         }
      });
   }
   catch(err)
   {
      res.status(500).send("Error saving video metadata: "+err.message)
   }
}
const deleteVideo= async(req,res)=>{
   if(req.result.role!='admin')// checking if the user is an admin
      return res.status(403).send("Access denied: Admins only");
      try{
         const {problemId}=req.params;
         const video=await solutionVideoCollection.findOneAndDelete({problemId});
         if(!video)
            return res.status(404).send("Video not found");
         await cloudinary.uploader.destroy(video.cloudinaryPublicId,{resource_type: 'video',invalidate:true}); // deleting the video from cloudinary
         res.status(200).send("Video deleted successfully");
      }  
      catch(err)
      {
         res.status(500).send("Error deleting video: "+err.message)
      }
}
module.exports={generateUploadSignature,saveVideoMetaData,deleteVideo};