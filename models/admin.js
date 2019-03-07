const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema({
   username:{
       type: String,
      
   },
   password:{
       type: String,
      
   }   
});

module.exports = mongoose.model('admin_Info', userSchema,'admin_Info') ;