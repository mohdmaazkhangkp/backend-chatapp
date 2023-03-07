const asyncHandler = require("express-async-handler");
const generateToken = require("../config/generateTokens");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");


const registerUser = asyncHandler( async (req,res)=>{
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        res.status(400).json({ message: "Please Enter al the required fields" });

    }
    const userExists = await User.findOne({email});
    if(userExists){
         res.status(400).json({ message: "USer already exist" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password:hashPassword,
    });
    
    if(user){
        res.status(201).json({
            _id: user._id,
            name:user.name,
            email:user.email,
            token: generateToken(user._id),
        });
    } else{
        res.status(400).json({ message: "failed to create the user" });
    }
});


const authUser = asyncHandler( async(req,res)=>{
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
        res.status(401).json({ message: "Invalid email or password" });
    }
});

// api/user?serach=maaz
const allUsers = asyncHandler(async(req,res)=>{
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } }
          ],
        }
      : {};
      const users = await User.find(keyword).find({_id:{$ne:req.user._id}});
      res.send(users);
});



module.exports = { registerUser, authUser, allUsers };