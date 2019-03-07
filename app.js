const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

const app=express();
const store = new MongoDBStore({
  uri: 'mongodb+srv://fall18id:fall18password@cluster0-vyvsc.mongodb.net/mydb',
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');


app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);



app.use(userRoutes);
app.use(authRoutes);



//db connections
mongoose.connect('mongodb+srv://fall18id:fall18password@cluster0-vyvsc.mongodb.net/mydb?retryWrites=true')
  .then(result => {
    console.log('Connected to mongodb');
    app.listen(3000);    
  })
  .catch(err => {
    console.log(err);
  });
