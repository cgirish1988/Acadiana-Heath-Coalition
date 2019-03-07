const path = require('path');
const express = require('express');
const router = express();
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://fall18id:fall18password@cluster0-vyvsc.mongodb.net';
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const Admin = require('../models/admin');


//getLogin
router.get('/getLogin', function(req,res){
    //console.log(req.session.isloggedIn);
    res.render(path.join(__dirname, '../','views','login.ejs'),  { pageTitle :'Login', isAuthenticated: false });
}); 

//postLogin
router.post('/postLogin', function(req,res){
    var username = req.body.username;
    var password = req.body.password;    
    User.find({ username: username })
    .then( user => { 
        //console.log(user.length);      
        if(user.length === 0){
            //console.log('1 got exicuted');
            res.redirect('/getSignup');
            //return res.render(path.join(__dirname, '../','views','signup.ejs'),  { pageTitle :'Signup' });
            }
            bcrypt.compare(password,user[0].password)
            .then( doMatch => {
                if(doMatch){
                    console.log("Password Matched");                    
                    req.session.isloggedIn = true;
                    req.session.isAdmin = false;
                    req.session.user = user;
                    //console.log(req.session);
                    return req.session.save( err => {
                         console.log(err);
                         //console.log('2 got exicuted');    
                         res.redirect('/');                                              
                    });                                       
                }
                //console.log('3 got exicuted');
                return res.redirect('/getLogin');
                    //return res.render(path.join(__dirname, '../','views','login.ejs'),  { pageTitle :'Login' });
            })
            .catch(err =>{
                //console.log('4 got exicuted');
                return res.redirect('/getLogin');
                //return res.render(path.join(__dirname, '../','views','login.ejs'),  { pageTitle :'Login' });
            });
    })
    .catch(err => {
        console.log(err);
    });     
});

router.post('/postAdminLogin', function(req,res){
    var username = req.body.username;
    var password = req.body.password;    
    Admin.findOne({ username: username })
    .then( user => {       
        if(!user){
            //console.log('1 got exicuted');
            res.redirect('/getSignup');
            //return res.render(path.join(__dirname, '../','views','signup.ejs'),  { pageTitle :'Signup' });
            }
            req.session.isloggedIn = true;
            req.session.isAdmin = true;
            req.session.user = user;
            //console.log(Admin);
            // return req.session.save( err => {
            //         console.log(err);
            //         //console.log('2 got exicuted');    
            //         res.redirect('/');     
            bcrypt.compare(password,user.password)
            .then( doMatch => {
                if(doMatch){
                    console.log("Password Matched");                    
                    req.session.isloggedIn = true;
                    req.session.isAdmin = true;
                    req.session.user = user;
                    console.log(req.session);
                    return req.session.save( err => {
                         console.log(err);
                         console.log('2 got exicuted');    
                         res.redirect('/');                                              
                    });                                       
                }
                //console.log('3 got exicuted');
                return res.redirect('/getLogin');
                    //return res.render(path.join(__dirname, '../','views','login.ejs'),  { pageTitle :'Login' });
            })
            .catch(err =>{
                //console.log('4 got exicuted');
                return res.redirect('/getLogin');
                //return res.render(path.join(__dirname, '../','views','login.ejs'),  { pageTitle :'Login' });
            });
            })
            .catch(err => {
                console.log(err);
            });     
    });


//getSignup
router.get('/getSignup', function(req,res){
    res.render(path.join(__dirname, '../','views','signup.ejs'),  { pageTitle :'Sign Up', isAuthenticated: false });    
}); 


//postSignup
router.post('/postSignup',function(req, res){
    var username = req.body.username;
    var password = req.body.password;     
    User.findOne({username :username})
    .then( userDoc => {
        if(userDoc){
            //return res.render(path.join(__dirname, '../','views','login.ejs'),  { pageTitle :'Login' });
            return res.redirect('/getLogin')
        }
        return bcrypt.hash(password,12)
        .then(hashpassword => {
            const user = new User({
                username: username,
                password: hashpassword,
                //agency: agency,
                //category: category                
                });                
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("mydb");
                    var myobj = {
                        username :username,
                        password :hashpassword
                    };
                    dbo.collection("pre_user_Info").insertOne(myobj, function(err, res) {
                      if (err) throw err;
                      console.log("1 document inserted");
                      db.close();
                    });
                });  
        })
        .then(result => {
            console.log('User Added');
            return res.redirect('/getLogin')                
            //res.render(path.join(__dirname, '../','views','index.ejs'),  { pageTitle :'Home' });
        });
    })
    .catch(err => {
        console.log(err);        
    });
});

//logout
router.get('/logout', function(req,res){
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
      });
}); 
    
module.exports = router;