const mongoose = require('mongoose');
const {Schema} = mongoose;
const userSchema=new Schema({
   firstName:{
      type:String,
      required:true,
      maxLength:20
   },
   lastName:{
      type:String,
      maxLength:20
   },
   emailId:{
      type:String,
      required:true,
      unique:true,
      trim:true,
      lowercase:true,
   },
   age:{
      type:Number,
      min:5,
      max:120
   },
   role:{
      type:String,
      enum:['user','admin'],
      default:'user'
   },
   problemSolved:[{
      type:Schema.Types.ObjectId,
      ref:'problem'
   }],
   password:{
      type:String,
      required:true,
   },
   gender:{
      type:String,
      enum:['Male','Female','Other','None'],
      default:'None'
   },
   about:{
      type:String,
      maxLength:500,
      default:''
   },
   socialLinks:{
      github:{type:String,default:''},
      linkedin:{type:String,default:''},
   },
   languagePreference:{
      type:String,
      enum:['javascript','python','java','c++','c','c#','None'],
      default:'None'
   },
   avatarUrl:{
      type:String,
      default:'/Avatars/Default.jpg'
   }
},{
   timestamps:true,
})
userSchema.post('findOneAndDelete',async function (deletedUser){// this function will be called after a user is deleted, after findByIdAndDelete is called
   if(deletedUser){
      await mongoose.model('problemSubmission').deleteMany({UserId:deletedUser._id});// delete all problem submissions related to the deleted user
   }
});

const User=mongoose.model('User',userSchema);
module.exports=User;