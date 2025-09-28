const express=require('express');
const tokenValidation=require('../middlewares/tokenValidator');
const router=express.Router();
const {generateUploadSignature,saveVideoMetaData,deleteVideo}=require('../RouteFunctions/solutionVideoRouteFunctions');

router.post("/save",tokenValidation,saveVideoMetaData);
router.delete("/delete/:problemId",tokenValidation,deleteVideo);
router.get("/createSig/:problemId",tokenValidation,generateUploadSignature);

module.exports=router;