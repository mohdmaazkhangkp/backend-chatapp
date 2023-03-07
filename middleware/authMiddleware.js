const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async(req,res,next)=>{
    let token;
    console.log(req.headers.authorization);
    console.log(req.headers.authorization.startsWith("Bearer"));
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        //decodes token id
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        console.log(decoded.id);
        req.user = await User.findById(decoded.id).select("-password");
        next();
      } catch (error) {
        res.status(401).json({ message: " Not authorized  Token Failed" });
      }
    }
    if(!token){
        res.status(401).json({ message: " Not authorized  No Token " });
    }
});
module.exports={protect};