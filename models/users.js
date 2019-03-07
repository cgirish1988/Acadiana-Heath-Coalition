const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema({

   username:{
       type: String      
   },
   password:{
       type: String
      
   },
    agency:{
       type: String
       
   },
   category:{
       type: String
       
   },   
   agencyId:{
       type:String
   }
});     

module.exports = mongoose.model('user_Info', userSchema,'user_Info') ;