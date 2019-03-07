const path = require('path');
const express = require('express');
const router = express();
const User = require('../models/users');
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId; 
const bcrypt = require('bcryptjs');
const url = 'mongodb+srv://fall18id:fall18password@cluster0-vyvsc.mongodb.net';


/* GET home page. */
router.get('/', function(req,res){      
    res.render(path.join(__dirname, '../','views','index.ejs'), { pageTitle :'Home', isAuthenticated:req.session.isloggedIn, isAdmin : req.session.isAdmin } );
});

router.get('/getuserInfo', function(req,res){    
    //console.log(req.session);
    //console.log(req.session.user[0].username)  ;
    username = req.session.user[0].username;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");        
        var query = {username : username};        
        dbo.collection("user_Info").find(query).toArray(function(err, userInfo) {
          if (err) throw err;                 
          console.log(userInfo); 
          res.render(path.join(__dirname, '../','views','userInfo.ejs'),          
            { 
                pageTitle :'UserInfo', 
                isAuthenticated:req.session.isloggedIn,
                isAdmin : req.session.isAdmin,
                //userInfo:req.session.user
                userInfo:userInfo
            });  
        });
        db.close();    
});
});


/////////////////////// Start of Hospice Relate Apis///////////////////////////////////////////////////////////////////////
router.get('/getAllHospice', function(req,res){   
    MongoClient.connect(url, function(err, db) {
        if(err) console.log(err);
        var dbo = db.db("mydb");
        dbo.collection("Hospice_Info")
        .find({}, { projection: { _id: 0, Agency: 1, Address: 1,  City: 1, State: 1, Zip: 1, Parish: 1, Phone_No1: 1, Phone_No2: 1 } })
        .toArray(function(err, myHospice) {
            if (err) console.log(err);
            //console.log(myHospice);
            res.render(path.join(__dirname, '../','views','viewHospice.ejs'),  {
                         pageTitle :'Hospice', 
                         isAuthenticated:req.session.isloggedIn,
                         isAdmin : req.session.isAdmin,
                         myHospice: myHospice
                        });           
        });
        db.close();    
    });    
});  


router.post('/postHospicedetails',function(req, res){
    var isAuthorised = req.body.isAuthorised;
    var agency = req.body.Agency;
    //console.log(agency);
    MongoClient.connect(url, function(err, db) {
        if (err) console.log(err);
        var dbo = db.db("mydb");       
        dbo.collection("Hospice_Info").aggregate([{
             $lookup:{
                 from: "Hospice_Insurance",
                 localField: 'Agency',
                 foreignField: 'Name',
                 as: 'Agency_Name'
                 }},
                 {
                    $match:{$and:[{"Agency" : agency}]}
                 },
        ])
        .toArray(function(err, myHospiceInfo) {
            if (err) console.log(err);
            //console.log(myHospiceInfo);            
            res.render(path.join(__dirname, '../','views','viewHospiceDetails.ejs'), 
            { 
                pageTitle :'Hospice Details', 
                isAuthenticated:req.session.isloggedIn,
                isAdmin : req.session.isAdmin,
                isAuthorised : isAuthorised,                
                myHospiceInfo: myHospiceInfo
            });  
        });   
        db.close();
    }); 
});

router.get('/addHospicedetails', function(req,res){ 
    res.render(path.join(__dirname, '../','views','addHospice.ejs'), { pageTitle :'Home', isAuthenticated:req.session.isloggedIn, isAdmin : req.session.isAdmin, } );
});

router.post('/addHospicedetails', function(req,res){ 
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myobj = {Agency: req.body.Agency, 
                     Address: req.body.Address,
                     City: req.body.City,
                     State: req.body.State,
                     Zip: req.body.Zip,
                     Phone_No1: req.body.Phone_No1,
                     Phone_No2: req.body.Phone_No2,
                     Parish: req.body.Parish,
                     Administrator_Name: req.body.Administrator_Name,
                     Admin_Phone_No: req.body.Admin_Phone_No,
                     Admin_Email: req.body.Admin_Email,
                     DON_Name: req.body.DON_Name,
                     DON_Phone_No: req.body.DON_Phone_No,
                     DON_Email: req.body.DON_Email,
                     Medical_Director1_Name: req.body.Medical_Director1_Name,
                     Medical_Director1_Phone_No: req.body.Medical_Director1_Phone_No,
                     Medical_Director1_Email: req.body.Medical_Director1_Email,
                     Medical_Director2_Name: req.body.Medical_Director2_Name,
                     Medical_Director2_Phone_No: req.body.Medical_Director2_Phone_No,
                     Medical_Director2_Email: req.body.Medical_Director2_Email,
                     Associate_Medical_Director1: req.body.Associate_Medical_Director1,
                     Associate_Medical_Director2: req.body.Associate_Medical_Director2,
                     Associate_Medical_Director3: req.body.Associate_Medical_Director3,
                     Website: req.body.Website,
                     Accept_Weekend_Admits: req.body.Accept_Weekend_Admits,
                     Evaluate_New_Referrals_on_Weekends: req.body.Evaluate_New_Referrals_on_Weekends,
                     Transportation_Plan_A: req.body.Transportation_Plan_A,
                     Transportation_Plan_B: req.body.Transportation_Plan_B,
                     Social_Worker1_Name: req.body.Social_Worker1_Name,
                     Social_Worker1_Phone_No: req.body.Social_Worker1_Phone_No,
                     Social_Worker1_Email: req.body.Social_Worker1_Email,
                     Social_Worker2_Name: req.body.Social_Worker2_Name,
                     Social_Worker2_Phone_No: req.body.Social_Worker2_Phone_No,
                     Social_Worker2_Email: req.body.Social_Worker2_Email,
                     Social_Worker: req.body.Social_Worker,
                     Volunteers: req.body.Volunteers,
                     Volunteers_Coordinator_Name: req.body.Volunteers_Coordinator_Name
        };
        dbo.collection("Hospice_Info").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
        });     
    });
    //console.log("The added user is", req.session.user[0].username );
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myobj = {
            username : req.session.user[0].username,
            password : req.session.user[0].password,
            agency: req.body.Agency, 
            category: "Hospice"
        };        
        dbo.collection("user_Info").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
        });     
    });
    res.redirect('/');  
});

router.post('/editGetHospicedetails', function(req,res){
    agencyid = req.body.agencyid;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");        
        var query = {_id : new mongodb.ObjectID(agencyid)};        
        dbo.collection("Hospice_Info").find(query).toArray(function(err, myHospiceInfo) {
          if (err) throw err;
          //console.log(myHospiceInfo);       
          res.render(path.join(__dirname, '../','views','updateHospice.ejs'),
              { 
                  pageTitle :'Hospice', 
                  isAuthenticated:req.session.isloggedIn, 
                  isAdmin : req.session.isAdmin,                 
                  myHospiceInfo: myHospiceInfo                  
                });      
        });
        db.close();
    });   
});

router.post('/editpostHospicedetails', function(req,res){
    //console.log(req.body.agencyid);
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myquery = { _id : new mongodb.ObjectID(agencyid)};
        var newvalues = { $set: {
                                  Address: req.body.Address,
                                  City: req.body.City,
                   } 
                  };
        dbo.collection("Hospice_Info").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
          console.log("1 document updated");
          db.close();
        }); 
      });
      res.redirect('/');    
});

router.post('/deleteHospicedetails', function(req,res){ 
    agency = req.body.agencyid;      
    console.log(agency);
    MongoClient.connect(url, function(err, db) {
       if (err) console.log(err);
       var dbo = db.db("mydb");  
       dbo.collection("Hospice_Info").remove({_id : new mongodb.ObjectID(agency)}).catch(err => {
          // console.log("Error When deleting");
           console.log(err);
       });  
       var myquery = { agency: req.body.agency }; 
       console.log("to-be-deleted agency: " + req.body.agency);  
       dbo.collection("user_Info").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
          }); 
       res.redirect('/');   
    });
});
/////////////////////// End of Hospice Relate Apis///////////////////////////////////////////////////////////////////////


/////////////////////// End of Behavioral Relate Apis///////////////////////////////////////////////////////////////////////
router.get('/getAllBehavioral', function(req,res){
    MongoClient.connect(url, function(err, db) {
        if (err) console.log(err);
        var dbo = db.db("mydb");
        dbo.collection("Behavioral_Info")
        .find({}, { projection: { _id: 0, Agency: 1, Address: 1,  City: 1, State: 1, Zip: 1, Parish: 1, Phone_No1: 1, Phone_No2: 1 } })
        .toArray(function(err, myBehavioral) {
          if (err) console.log(err);
          res.render(path.join(__dirname, '../','views','viewBehavioral.ejs'),{
                     pageTitle :'Behavioral', 
                     isAuthenticated:req.session.isloggedIn,
                     isAdmin : req.session.isAdmin,
                     myBehavioral: myBehavioral,
                    });          
        });
        db.close();
      });   
});

router.post('/postBehavioraldetails', function(req,res){
    var isAuthorised = req.body.isAuthorised;
    var agency =req.body.Agency;
    MongoClient.connect(url, function(err, db) {
        if (err) console.log(err);
        var dbo = db.db("mydb");
        
        dbo.collection("Behavioral_Info").aggregate([{ 
            $lookup:
            {
                from: "Behavioral_Insurance_and_Notes",
                localField: 'Agency',
                foreignField: 'Name',
                as: 'Agency_Name'
            }},
           {
               $match:{$and:[{"Agency" : agency}]}
           },
        ])
        .toArray(function(err, myBehavioralInfo) {
            if (err) console.log(err);
            res.render(path.join(__dirname, '../','views','viewBehavioralDetails.ejs'),
            { 
              pageTitle :'Behavioral', 
              isAuthenticated:req.session.isloggedIn,
              isAdmin : req.session.isAdmin,
              isAuthorised : isAuthorised,
              myBehavioralInfo:myBehavioralInfo
            });        
        });
        db.close();
    });    
});

router.get('/addBehaviouraldetails', function(req,res){ 
    res.render(path.join(__dirname, '../','views','addBehavioural.ejs'), { pageTitle :'Home', isAuthenticated:req.session.isloggedIn, isAdmin : req.session.isAdmin, } );
});

router.post('/addBehaviouraldetails', function(req,res){ 
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myobj = {Agency: req.body.Agency, 
                     Address: req.body.Address,
                     City: req.body.City,
                     State: req.body.State,
                     Zip: req.body.Zip,
                     Phone_No1: req.body.Phone_No1,
                     Phone_No2: req.body.Phone_No2,
                     Parish: req.body.Parish,
                     Administrator_Name: req.body.Administrator_Name,
                     Admin_Phone_No: req.body.Admin_Phone_No,
                     Admin_Email: req.body.Admin_Email,
                     DON_Name: req.body.DON_Name,
                     DON_Phone_No: req.body.DON_Phone_No,
                     DON_Email: req.body.DON_Email,
                     Medical_Director1_Name: req.body.Medical_Director1_Name,
                     Medical_Director1_Phone_No: req.body.Medical_Director1_Phone_No,
                     Medical_Director1_Email: req.body.Medical_Director1_Email,
                     Medical_Director2_Name: req.body.Medical_Director2_Name,
                     Medical_Director2_Phone_No: req.body.Medical_Director2_Phone_No,
                     Medical_Director2_Email: req.body.Medical_Director2_Email,
                     Associate_Medical_Director1: req.body.Associate_Medical_Director1,
                     Associate_Medical_Director2: req.body.Associate_Medical_Director2,
                     Associate_Medical_Director3: req.body.Associate_Medical_Director3,
                     Website: req.body.Website,
                     Accept_Weekend_Admits: req.body.Accept_Weekend_Admits,
                     Evaluate_New_Referrals_on_Weekends: req.body.Evaluate_New_Referrals_on_Weekends,
                     Transportation_Plan_A: req.body.Transportation_Plan_A,
                     Transportation_Plan_B: req.body.Transportation_Plan_B,
                     Social_Worker1_Name: req.body.Social_Worker1_Name,
                     Social_Worker1_Phone_No: req.body.Social_Worker1_Phone_No,
                     Social_Worker1_Email: req.body.Social_Worker1_Email,
                     Social_Worker2_Name: req.body.Social_Worker2_Name,
                     Social_Worker2_Phone_No: req.body.Social_Worker2_Phone_No,
                     Social_Worker2_Email: req.body.Social_Worker2_Email,
                     Social_Worker: req.body.Social_Worker,
                     Volunteers: req.body.Volunteers,
                     Volunteers_Coordinator_Name: req.body.Volunteers_Coordinator_Name
        };
        dbo.collection("Behavioral_Info").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
        });
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            var myobj = {
                username : req.session.user[0].username,
                password : req.session.user[0].password,
                agency: req.body.Agency, 
                category: "Behavioural"
            };        
            dbo.collection("user_Info").insertOne(myobj, function(err, res) {
              if (err) throw err;
              console.log("1 document inserted");
              db.close();
            });     
        });
        res.redirect('/');     
    });
});

router.post('/editGetBehavioraldetails', function(req,res){
    agencyid = req.body.agencyid;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");        
        var query = {_id : new mongodb.ObjectID(agencyid)};        
        dbo.collection("Behavioral_Info").find(query).toArray(function(err, myBehavioralInfo) {
          if (err) throw err;
          //console.log(myBehavioralInfo);       
          res.render(path.join(__dirname, '../','views','updateBehavioral.ejs'),
              { 
                  pageTitle :'Behavioral', 
                  isAuthenticated:req.session.isloggedIn,  
                  isAdmin : req.session.isAdmin,                
                  myBehavioralInfo: myBehavioralInfo                  
                });      
        });
        db.close();
    });   
});

router.post('/editpostBehaviouraldetails', function(req,res){
    //console.log(req.body.agencyid);
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myquery = { _id : new mongodb.ObjectID(agencyid)};
        var newvalues = { $set: {
                                  Address: req.body.Address,
                                  City: req.body.City,
                   } 
                  };
        dbo.collection("Behavioral_Info").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
          console.log("1 document updated");
          db.close();
        }); 
      });
      res.redirect('/');    
});

router.post('/deleteBehavioraldetails', function(req,res){ 
    agency = req.body.agencyid;      
    //console.log(agency);
    MongoClient.connect(url, function(err, db) {
       if (err) console.log(err);
       var dbo = db.db("mydb");  
       dbo.collection("Behavioral_Info").remove({_id : new mongodb.ObjectID(agency)}).catch(err => {
           //console.log("Error When deleting");
           console.log(err);
       });   
       var myquery = { agency: req.body.agency }; 
       console.log("to-be-deleted agency: " + req.body.agency);  
       dbo.collection("user_Info").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
          }); 
       res.redirect('/');           
    });
});
/////////////////////// End of Behavioral Relate Apis///////////////////////////////////////////////////////////////////////



/////////////////////// Start of Acute Relate Apis///////////////////////////////////////////////////////////////////////
router.get('/getAllAcute', function(req,res){
    MongoClient.connect(url, function(err, db) {
        if (err) console.log(err);
        var dbo = db.db("mydb");
        dbo.collection("Acute_Info")
        .find({}, { projection: { _id: 0, Agency: 1, Address: 1,  City: 1, State: 1, Zip: 1, Parish: 1, Phone_No1: 1, Phone_No2: 1 } })
        .toArray(function(err, myAcute) {
          if (err) console.log(err);
          res.render(path.join(__dirname, '../','views','viewAcute.ejs'),{
               pageTitle :'Acute Facility',
               isAuthenticated:req.session.isloggedIn,
               isAdmin : req.session.isAdmin,
               myAcute: myAcute
            });          
        });
        db.close();
      });    
});

router.post('/postAcutedetails', function(req,res){
    var isAuthorised = req.body.isAuthorised;
    var agency = req.body.Agency;
    MongoClient.connect(url, function(err, db) {
        if (err) Console.log(err);
        var dbo = db.db("mydb");
        var query = { Agency: req.body.Agency };        
        dbo.collection("Acute_Info").aggregate([{
             $lookup:
             {
                 from: "Acute_Info",
                 localField: 'Agency',
                 foreignField: 'Name',
                 as: 'Agency_Name'
                }},{$match:{$and:[{"Agency" : req.body.Agency}]}}
        ])
        .toArray(function(err, myAcuteInfo) {
            if (err) Console.log(err);           
            res.render(path.join(__dirname, '../','views','viewAcutedetails.ejs'),{
                pageTitle :'Acute Facility',
                isAuthenticated:req.session.isloggedIn, 
                isAdmin : req.session.isAdmin,               
                isAuthorised : isAuthorised,
                myAcuteInfo: myAcuteInfo
            });
        });
        db.close();
    });    
});

router.get('/addAcutedetails', function(req,res){ 
    res.render(path.join(__dirname, '../','views','addAcute.ejs'), { pageTitle :'Home', isAuthenticated:req.session.isloggedIn,isAdmin : req.session.isAdmin, } );
});

router.post('/addAcutedetails', function(req,res){ 
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myobj = {Agency: req.body.Agency, 
                     Address: req.body.Address,
                     City: req.body.City,
                     State: req.body.State,
                     Zip: req.body.Zip,
                     Phone_No1: req.body.Phone_No1,
                     Phone_No2: req.body.Phone_No2,
                     Parish: req.body.Parish,
                     Hosp_Info_Location1: req.body.Hosp_Info_Location1,
                     Hosp_Info_Supervisor1: req.body.Hosp_Info_Supervisor1,
                     Hosp_Info_Phone1: req.body.Hosp_Info_Phone1,
                     Hosp_Info_Fax1: req.body.Hosp_Info_Fax1,
                     Hosp_Info_Location2: req.body.Hosp_Info_Location2,
                     Hosp_Info_Supervisor2: req.body.Hosp_Info_Supervisor2,
                     Hosp_Info_Phone2: req.body.Hosp_Info_Phone2,
                     Hosp_Info_Fax2: req.body.Hosp_Info_Fax2,
                     Hosp_Info_Location3: req.body.Hosp_Info_Location3,
                     Hosp_Info_Supervisor3: req.body.Hosp_Info_Supervisor3,
                     Hosp_Info_Phone3: req.body.Hosp_Info_Phone3,
                     Hosp_Info_Fax3: req.body.Hosp_Info_Fax3,
                     Hosp_Info_Location4: req.body.Hosp_Info_Location4,
                     Hosp_Info_Supervisor4: req.body.Hosp_Info_Supervisor4,
                     Hosp_Info_Phone4: req.body.Hosp_Info_Phone4,
                     Hosp_Info_Fax4: req.body.Hosp_Info_Fax4,
                     Hosp_Info_Location5: req.body.Hosp_Info_Location5,
                     Hosp_Info_Supervisor5: req.body.Hosp_Info_Supervisor5,
                     Hosp_Info_Phone5: req.body.Hosp_Info_Phone5,
                     Hosp_Info_Fax5: req.body.Hosp_Info_Fax5,
                     Admin_Location1: req.body.Admin_Location1,
                     Admin_Name1: req.body.Admin_Name1,
                     Admin_Phone1: req.body.Admin_Phone1,
                     Admin_Fax1: req.body.Admin_Fax1,
                     Admin_Location2: req.body.Admin_Location2,
                     Admin_Name2: req.body.Admin_Name2,
                     Admin_Phone2: req.body.Admin_Phone2,
                     Admin_Fax2: req.body.Admin_Fax2,
                     Admin_Location3: req.body.Admin_Location3,
                     Admin_Name3: req.body.Admin_Name3,
                     Admin_Phone3: req.body.Admin_Phone3,
                     Admin_Fax3: req.body.Admin_Fax3,
                     Admin_Location4: req.body.Admin_Location4,
                     Admin_Name4: req.body.Admin_Name4,
                     Admin_Phone4: req.body.Admin_Phone4,
                     Admin_Fax4: req.body.Admin_Fax4,
                     Admin_Location5: req.body.Admin_Location5,
                     Admin_Name5: req.body.Admin_Name5,
                     Admin_Phone5: req.body.Admin_Phone5,
                     Admin_Fax5: req.body.Admin_Fax5,
                     Case_Mgt_Dept_Location1: req.body.Case_Mgt_Dept_Location1,
                     Case_Mgt_Dept_Name1: req.body.Case_Mgt_Dept_Name1,
                     Case_Mgt_Dept_Phone1: req.body.Case_Mgt_Dept_Phone1,
                     Case_Mgt_Dept_Fax1: req.body.Case_Mgt_Dept_Fax1,
                     Case_Mgt_Dept_Location2: req.body.Case_Mgt_Dept_Location2,
                     Case_Mgt_Dept_Name2: req.body.Case_Mgt_Dept_Name2,
                     Case_Mgt_Dept_Phone2: req.body.Case_Mgt_Dept_Phone2,
                     Case_Mgt_Dept_Fax2: req.body.Case_Mgt_Dept_Fax2,
                     Case_Mgt_Dept_Location3: req.body.Case_Mgt_Dept_Location3,
                     Case_Mgt_Dept_Name3: req.body.Case_Mgt_Dept_Name3,
                     Case_Mgt_Dept_Phone3: req.body.Case_Mgt_Dept_Phone3,
                     Case_Mgt_Dept_Fax3: req.body.Case_Mgt_Dept_Fax3,
                     Case_Mgt_Dept_Location4: req.body.Case_Mgt_Dept_Location4,
                     Case_Mgt_Dept_Name4: req.body.Case_Mgt_Dept_Name4,
                     Case_Mgt_Dept_Phone4: req.body.Case_Mgt_Dept_Phone4,
                     Case_Mgt_Dept_Fax4: req.body.Case_Mgt_Dept_Fax4,
                     Facility_Serv_Emergency_Department: req.body.Facility_Serv_Emergency_Department,
                     Facility_Serv_Trauma_Center: req.body.Facility_Serv_Trauma_Center,
                     Facility_Serv_Cardiac_ICU: req.body.Facility_Serv_Cardiac_ICU,
                     Facility_Serv_Neurology_ICU: req.body.Facility_Serv_Neurology_ICU,
                     Facility_Serv_Surgical_ICU: req.body.Facility_Serv_Surgical_ICU,
                     Facility_Serv_Telemetry_Unit: req.body.Facility_Serv_Telemetry_Unit,
                     Facility_Serv_Surgery_Department: req.body.Facility_Serv_Surgery_Department,
                     Facility_Serv_Bariatric_Services: req.body.Facility_Serv_Bariatric_Services,
                     Facility_Serv_Hyperbaric_Unit: req.body.Facility_Serv_Hyperbaric_Unit,
                     Facility_Serv_Wound_Care_Clinic: req.body.Facility_Serv_Wound_Care_Clinic,
                     Facility_Serv_Orthopedics: req.body.Facility_Serv_Orthopedics,
                     Facility_Serv_Neurological_Services: req.body.Facility_Serv_Neurological_Services,
                     Facility_Serv_Oncology_Services: req.body.Facility_Serv_Oncology_Services,
                     Facility_Serv_Outpatient_Oncology_Services: req.body.Facility_Serv_Outpatient_Oncology_Services,
                     Facility_Serv_Radiation_Therapy: req.body.Facility_Serv_Radiation_Therapy,
                     Facility_Serv_Burn_Unit: req.body.Facility_Serv_Burn_Unit,
                     Facility_Serv_Outpatient_Burn_Clinic: req.body.Facility_Serv_Outpatient_Burn_Clinic,
                     Facility_Serv_Acute_Inpatient_Rehab_Unit: req.body.Facility_Serv_Acute_Inpatient_Rehab_Unit,
                     Facility_Serv_Outpatient_Physical_Therapy: req.body.Facility_Serv_Outpatient_Physical_Therapy,
                     Facility_Serv_Obstetrics_Services: req.body.Facility_Serv_Obstetrics_Services,
                     Facility_Serv_Gynecology_Services: req.body.Facility_Serv_Gynecology_Services,
                     Facility_Serv_Pediatrics: req.body.Facility_Serv_Pediatrics, 
                     Facility_Serv_Pediatric_Trauma_Center: req.body.Facility_Serv_Pediatric_Trauma_Center,
                     Facility_Serv_Pediatric_ICU: req.body.Facility_Serv_Pediatric_ICU,
                     Facility_Serv_Neonatal_Services: req.body.Facility_Serv_Neonatal_Services,
                     Facility_Serv_Neonatal_ICU: req.body.Facility_Serv_Neonatal_ICU,
                     Facility_Serv_Psychiatric_Inpatient_Services: req.body.Facility_Serv_Psychiatric_Inpatient_Services,
                     Facility_Serv_Psychiatric_Outpatient_Services: req.body.Facility_Serv_Psychiatric_Outpatient_Services,
                     Facility_Serv_Outpatient_Cardiac_Rehab: req.body.Facility_Serv_Outpatient_Cardiac_Rehab,
                     Facility_Serv_Swing_Bed_SNF_Services: req.body.Facility_Serv_Swing_Bed_SNF_Services,
            
        };
        dbo.collection("Acute_Info").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
        });     
    });
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myobj = {
            username : req.session.user[0].username,
            password : req.session.user[0].password,
            agency: req.body.Agency, 
            category: "Acute"
        };        
        dbo.collection("user_Info").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
        });     
    });
    res.redirect('/');
});

router.post('/editGetAcutedetails', function(req,res){  	
    agencyid = req.body.agencyid;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");        
        var query = {_id : new mongodb.ObjectID(agencyid)};        
        dbo.collection("Acute_Info").find(query).toArray(function(err, myAcuteInfo) {
          if (err) throw err;
          //console.log(myAcuteInfo);       
          res.render(path.join(__dirname, '../','views','updateAcute.ejs'),
              { 
                  pageTitle :'Acute', 
                  isAuthenticated:req.session.isloggedIn,    
                  isAdmin : req.session.isAdmin,              
                  myAcuteInfo: myAcuteInfo                  
                });      
        });
        db.close();
    });   
});

router.post('/editpostAcutedetails', function(req,res){
    //console.log(req.body.agencyid);
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myquery = { _id : new mongodb.ObjectID(agencyid)};
        var newvalues = { $set: {
                                  Address: req.body.Address,
                                  City: req.body.City,
                   } 
                  };
        dbo.collection("Acute_Info").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
          console.log("1 document updated");
          db.close();
        }); 
      });
      res.redirect('/');    
});

router.post('/deleteAcutedetails', function(req,res){ 
    agency = req.body.agencyid;      
    //console.log(agency);
    MongoClient.connect(url, function(err, db) {
       if (err) console.log(err);
       var dbo = db.db("mydb");  
       dbo.collection("Acute_Info").remove({_id : new mongodb.ObjectID(agency)}).catch(err => {
           console.log("Error When deleting?????");
           console.log(err);
       });
       var myquery = { agency: req.body.agency }; 
       console.log("to-be-deleted agency: " + req.body.agency);  
       dbo.collection("user_Info").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
          });        
       res.redirect('/');           
    });
});
/////////////////////// End of Acute Relate Apis///////////////////////////////////////////////////////////////////////





/////////////////////// Start of Assisted Relate Apis///////////////////////////////////////////////////////////////////////
router.get('/getAllAssistedLiving', function(req,res){
    MongoClient.connect(url, function(err, db) {
        if (err) console.log(err);
        var dbo = db.db("mydb");
        dbo.collection("Assisted_Info")
        .find({}, { projection: { _id: 0, Agency: 1, Address: 1,  City: 1, State: 1, Zip: 1, Parish: 1, Phone_No1: 1, Phone_No2: 1 } })
        .toArray(function(err, myAssistedLiving) {
          if (err) console.log(err);
          res.render(path.join(__dirname, '../','views','viewAssistedLiving.ejs'),{
                         pageTitle :'Assisted Living', 
                         isAuthenticated:req.session.isloggedIn,
                         isAdmin : req.session.isAdmin,
                         myAssistedLiving: myAssistedLiving
                        });
        });
        db.close();
      });    
});

router.post('/postAssistedLivingdetails', function(req,res){    
    var isAuthorised = req.body.isAuthorised;
    var agency = req.body.Agency;
    MongoClient.connect(url, function(err, db) {
        if (err) Console.log(err);
        var dbo = db.db("mydb");        
        dbo.collection("Assisted_Info").aggregate([{
             $lookup:
             {
                 from: "Assisted_Services_Insurance",
                 localField: 'Agency',
                 foreignField: 'Name',
                 as: 'Agency_Name'
                }},{
                    $match:{$and:[{"Agency" : req.body.Agency}]}
                    }
        ])
        .toArray(function(err, myAssistedLivingInfo) {
            if (err) console.log(err);
            res.render(path.join(__dirname, '../','views','viewAssistedLivingdetails.ejs'),
              { 
                  pageTitle :'Assisted Living', 
                  isAuthenticated:req.session.isloggedIn,
                  isAdmin : req.session.isAdmin,
                  isAuthorised : isAuthorised,
                  myAssistedLivingInfo: myAssistedLivingInfo                  
                });           
        });
        db.close();
    });
});

router.get('/addAssistedLivingdetails', function(req,res){ 
    res.render(path.join(__dirname, '../','views','addAssistedLiving.ejs'), { pageTitle :'Home', isAuthenticated:req.session.isloggedIn,isAdmin : req.session.isAdmin, } );
});

router.post('/addAssistedLivingdetails', function(req,res){ 
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myobj = {Agency: req.body.Agency, 
                     Address: req.body.Address,
                     City: req.body.City,
                     State: req.body.State,
                     Zip: req.body.Zip,
                     Phone_No1: req.body.Phone_No1,
                     Phone_No2: req.body.Phone_No2,
                     Parish: req.body.Parish,
                     Administrator_Name: req.body.Administrator_Name,
                     Admin_Phone_No: req.body.Admin_Phone_No,
                     Admin_Email: req.body.Admin_Email,
                     Wellness_Coordinator1_Name: req.body.Wellness_Coordinator1_Name,
                     Wellness_Coordinator1_Phone_No: req.body.Wellness_Coordinator1_Phone_No,
                     Wellness_Coordinator1_Email: req.body.Wellness_Coordinator1_Email,
                     Medical_Director1_Name: req.body.Medical_Director1_Name,
                     Medical_Director1_Phone_No: req.body.Medical_Director1_Phone_No,
                     Medical_Director1_Email: req.body.Medical_Director1_Email,
                     Medical_Director2_Name: req.body.Medical_Director2_Name,
                     Medical_Director2_Phone_No: req.body.Medical_Director2_Phone_No,
                     Medical_Director2_Email: req.body.Medical_Director2_Email,
                     DON: req.body.DON,
                     Website: req.body.Website,
                     Transportation_PlanA: req.body.Transportation_PlanA,
                     Transportation_PlanB: req.body.Transportation_PlanB,
                     Required_Info_for_Admittance1: req.body.Required_Info_for_Admittance1,
                     Required_Info_for_Admittance2: req.body.Required_Info_for_Admittance2,
                     Required_Info_for_Admittance3: req.body.Required_Info_for_Admittance3,
                     Required_Info_for_Admittance4: req.body.Required_Info_for_Admittance4,
                     Required_Info_for_Admittance5: req.body.Required_Info_for_Admittance5,
                     Required_Info_for_Admittance6: req.body.Required_Info_for_Admittance6,
                     Required_Info_for_Admittance7: req.body.Required_Info_for_Admittance7,
                     Required_Info_for_Admittance8: req.body.Required_Info_for_Admittance8,
                     Required_Info_for_Admittance9: req.body.Required_Info_for_Admittance9,
                     Required_Info_for_Admittance10: req.body.Required_Info_for_Admittance10,
                     Required_Info_for_Admittance11: req.body.Required_Info_for_Admittance11,
                     Required_Info_for_Admittance12: req.body.Required_Info_for_Admittance12,
                     Office_HoursOffice_Hours: req.body.Office_HoursOffice_Hours,
                     Specialized_Services: req.body.Specialized_Services,
                     Specialized_Services2: req.body.Specialized_Services2,
                     Specialized_Services3: req.body.Specialized_Services3,
                     Specialized_Services4: req.body.Specialized_Services4,
                  
        };
        dbo.collection("Assisted_Info").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();          
        });
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            var myobj = {
                username : req.session.user[0].username,
                password : req.session.user[0].password,
                agency: req.body.Agency, 
                category: "Assisted"
            };        
            dbo.collection("user_Info").insertOne(myobj, function(err, res) {
              if (err) throw err;
              console.log("1 document inserted");
              db.close();
            });     
        });
     res.redirect('/');
    });
});

router.post('/editGetAssistedLivingdetails', function(req,res){
    agencyid = req.body.agencyid;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");        
        var query = {_id : new mongodb.ObjectID(agencyid)};        
        dbo.collection("Assisted_Info").find(query).toArray(function(err, myAssistedLivingInfo) {
          if (err) throw err;
          //console.log(myAssistedLivingInfo);       
          res.render(path.join(__dirname, '../','views','updateAssistedLiving.ejs'),
              { 
                  pageTitle :'Assisted Living', 
                  isAuthenticated:req.session.isloggedIn, 
                  isAdmin : req.session.isAdmin,                 
                  myAssistedLivingInfo: myAssistedLivingInfo                  
                });      
        });
        db.close();
    });   
});

router.post('/editpostAssistedLivingdetails', function(req,res){
    //console.log(req.body.agencyid);
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myquery = { _id : new mongodb.ObjectID(agencyid)};
        var newvalues = { $set: {
                                  Address: req.body.Address,
                                  City: req.body.City,
                   } 
                  };
        dbo.collection("Assisted_Info").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
          console.log("1 document updated");
          db.close();
        }); 
      });
      res.redirect('/');    
});

router.post('/deleteAssistedLivingdetails', function(req,res){ 
    agencyid = req.body.agencyid;      
    //console.log(agency);
    MongoClient.connect(url, function(err, db) {
       if (err) console.log(err);
       var dbo = db.db("mydb");  
       dbo.collection("Assisted_Info").remove({_id : new mongodb.ObjectID(agencyid)}).catch(err => {
           //console.log("Error When deleting");
           console.log(err);
       });
       var myquery = { agency: req.body.agency }; 
       console.log("to-be-deleted agency: " + req.body.agency);  
       dbo.collection("user_Info").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
          }); 
       res.redirect('/');       
    });
});
/////////////////////// End of Assisted Relate Apis///////////////////////////////////////////////////////////////////////

/////////////////Start of admin APis/////////////////////////////////////////////////////////////////////////////////////

router.get('/getPendingUsers', function(req,res){    
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");        
        // var query = {username : username};   
        dbo.collection("pre_user_Info").find({}, { projection: { _id: 0, username: 1, password:3}})
        .toArray(function(err, userInfo) {
            if (err) console.log(err);                 
            //console.log(userInfo); 
            res.render(path.join(__dirname, '../','views','adminPage.ejs'),          
            { 
                pageTitle :'Pending Approval', 
                isAuthenticated:req.session.isloggedIn,
                isAdmin:req.session.isAdmin,
                //userInfo:req.session.user
                userInfo:userInfo
            });
        });    
    db.close();    
    });
});

router.post('/approveUser', function(req,res){ 
   if(Array.isArray(req.body.username)) {  
       //console.log(req.body.username);
       //console.log(req.body.password);
       req.body.username.forEach(element => {
           console.log(element);
           MongoClient.connect(url, function(err, db) {
               if (err) throw err;
               var dbo = db.db("mydb");        
               var myquery = {username : element};   
               dbo.collection("pre_user_Info").find(myquery)
               .toArray(function(err, userInfo) {
                   if (err) console.log(err); 
                   userInfo.forEach(function(userObj) {
                       MongoClient.connect(url, function(err, db) {
                           if (err) throw err;
                           var dbo = db.db("mydb");
                           var myobj = {
                               username : userObj.username,
                               password : userObj.password,
                               agency: "", 
                               category: ""
                            };        
                            dbo.collection("user_Info").insertOne(myobj, function(err, res) {
                                if (err) throw err;
                                console.log("1 document inserted");
                                db.close();
                            });
                        });
                    });
                });
                db.close();    
            });
       });
    MongoClient.connect(url, function(err, db) {
        if (err) console.log(err) ;
        var dbo = db.db("mydb");
        var myquery = { username: { $in: req.body.username }};        
        dbo.collection("pre_user_Info").deleteMany(myquery, function(err, obj) {
            if (err) console.log(err) ;
            console.log(obj.result.n + " document(s) deleted");              
        });
    });
    res.redirect('/');       
   }
   else{
    console.log(req.body);   
    console.log(req.body.username);
    console.log(req.body.password);
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myobj = {
            username : req.body.username,
            password : req.body.password,
            agency: "", 
            category: ""
         };        
         dbo.collection("user_Info").insertOne(myobj, function(err, res) {
             if (err) throw err;
             console.log("1 document inserted");
             db.close();
         });
     });
    MongoClient.connect(url, function(err, db) {
        if (err) console.log(err) ;
        var dbo = db.db("mydb");
        var myquery = { username: req.body.username };        
        dbo.collection("pre_user_Info").deleteOne(myquery, function(err, obj) {
            if (err) console.log(err) ;                        
        });
    });
    res.redirect('/');       
   } 
});
//////////////////End if Admi Apis//////////////////////////////////////////////////////////////////////////////////////










    













// router.post('/postSignup',function(req, res){
//     var username = req.body.username;
//     var password = req.body.password;
//     var agency = req.body.agency;
//     var city = req.body.city;     
//     var user = new User({
//         username: username,
//         password: password,
//         agency: agency,
//         city: city
//     });
//     user.save().then(result => {        
//         console.log('User Added');                
//         res.render(path.join(__dirname, '../','views','sample.ejs'),  { pageTitle :'Index', actionResult:'Succesful Sign Up' });
//         }).catch(err => {
//             console.log(err);
//             });
// });

// router.get('/allUsers', function(req,res){    
//     User.find()
//       .then(users => {
//         console.log(users);        
//       })
//       .catch(err => {
//         console.log(err);
//       });
// }); 

// router.post('/login',function(req,res){
//     var username = req.body.username;
//     var password = req.body.password;
//     User.find({ username: username, password: password})
//     .then( user =>{
//         if(user){
//             res.sendfile(path.join(__dirname, '../','views','index.ejs'));
            
//             console.log("Login Successful");
//         }
//         else{
//             console.log("Login Unsuccessful");
//         }
//         console.log(user);
//     }).catch(err =>{
//         console.log(err);
//     })
// });

module.exports = router;