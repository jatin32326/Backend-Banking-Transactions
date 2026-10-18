const tokenBlackListModel = require("../models/blackList.model.js");
const userModel = require("../models/user.model.js")
const jwt = require("jsonwebtoken")


// user Register controller
async function registerController(req,res){
    const{email,name,password}=req.body;
    
    const isExist = await userModel.findOne({
        email:email
    })

    if(isExist){
        return res.status(422).json({
            message:"user already exists with this email",
            status:"Failed"
        })
    }

    const user = await userModel.create({
        email,name,password
    })
    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})

    res.cookie("token",token);
    res.status(201).json({
        user:{
            _id:user._id,
            name:user.name,
            email:user.email,
            message:"user Registered"
        }
    })
}

// user login controller

async function loginController(req,res){
    const{email,password}=req.body;
    const user = await userModel.findOne({email}).select("+password")

    if(!user){
       return  res.status(401).json({
            message:"email or password Invalid",
            success:false,
            error:true
        })
    }
    const isValidPassword = await user.comparePassword(password)

    if(!isValidPassword){
        return res.status(401).json({
            message:"Email or password Invalid"
        })
    }

    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})

    res.cookie("token",token)

    res.status(200).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name,
            message:"user login successfully"
        }
    })
}

// user Logout Controller

async function logoutController(req,res){
    const token = req.cookies.token||req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(200).json({
            message:"User logged out Successfully"
        })
    }

    res.cookie("token","")

    await tokenBlackListModel.create({
        token:token
    })

    res.status(200).json({
        message:"User logout successfully"
    })

}

module.exports = {
    registerController,loginController,logoutController
}