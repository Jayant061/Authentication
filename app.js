//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect(process.env.MONGOURL + "retryWrites=true&w=majority")
const userSchema = new mongoose.Schema({
    email:String,
    password:String,
});


userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:['password'],decryptPostSave:false});

const User = mongoose.model("User",userSchema);


app.get("/",function(req,res){
    res.render("home");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
})
app.post("/register", async function(req,res){

    const existingUser = await User.findOne({email:req.body.username});

    if(!existingUser){
        const newUser = new User({
            email:req.body.username,
            password:req.body.password    
        });
        await newUser.save();
        res.render("secrets");
    }
    else{
        res.status(404)
        res.write("user Already exists!");
        res.end();
    }
    
    
})
app.post("/login", async function(req,res){
    const username = req.body.username;
    const password = req.body.password;
    const user = await User.findOne({email:username});
    // console.log(user);
    if(user){

        if(user.password === password){
            res.render("secrets");
        }
        else{
            res.write("Incorrect Password Please try again");
            res.status(401);
            res.end();
        }
    }else{
        res.write("User not found pleadse register before procedding");
        res.status(404);
        res.end();
    }
   
})



app.listen(3000,function(){console.log('server is running at port 3000');});