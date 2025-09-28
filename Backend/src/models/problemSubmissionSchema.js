const mongoose = require('mongoose');
const {Schema} = mongoose;
const SubmissionSchema=new Schema({
   userId:{
      type:Schema.Types.ObjectId,
      ref:'User',
      required:true
   },
   problemId:{
      type:Schema.Types.ObjectId,
      ref:'problem',
      required:true,
   },
   code:{
      type:String,
      required:true
   },
   language:{
      type:String,
      enum:['javascript','python','java','c++','c','c#'],
      required:true
   },
   status:{
      type:String,
      enum:['pending','accepted','wrong answer','time limit exceeded','runtime error','compilation error','error'],
      default:'pending'
   },
   runtime:{
      type:Number,
      default:0
   },
   memory:{
      type:Number,
      default:0
   },
   errorMessage:{  
      type:String,
      default:''
   },
   testCasesPassed:{
      type:Number,
      default:0
   },
   testCasesTotal:{
      type:Number,
      default:0
   }
},{
   timestamps:true,
})
SubmissionSchema.index({userId:1,problemId:1});
const problemSubmissions=mongoose.model('problemSubmission',SubmissionSchema);
module.exports=problemSubmissions;