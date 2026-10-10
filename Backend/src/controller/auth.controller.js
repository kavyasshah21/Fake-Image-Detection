const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")


async function Signup(req,res){

    try {

        const {username , email , password} = req.body

        if(!username || !email || !password){
            return res.status(400).json({
                message : "Username, email and password are required"
            })
        }

        const isUserAlreadyExist = await userModel.findOne({
            $or : [ {username} , {email} ]
        })



        if(isUserAlreadyExist){
            return res.status(409).json({
                message : " User Already Exists"
            })
        }

        const hash = await bcrypt.hash(password , 10)

        const user = await userModel.create({
            username,
            email,
            password : hash
        })

        const token = jwt.sign({
            id : user._id
        }, process.env.JWT_SECRET)

        res.cookie("token",token)

        return res.status(201).json({
            message : "User Registered Successfully",
            user : {
                id : user._id,
                username : user.username,
                email : user.email
            }
        })

    } catch(error){

        return res.status(500).json({
            message : "Something Went Wrong"
        })
    }
}


async function Login(req,res){

    try {

        const {username , email, password} = req.body

        if(!username && !email || !password){
            return res.status(400).json({
                message : "Username or email and password are required"
    })
}

        const user = await userModel.findOne({
            $or : [ {username} , {email} ]
        })

        if(!user){
            return res.status(401).json({
                message : "User Not Exist"
            })
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        )

        if(!isPasswordValid){
            return res.status(401).json({
                message : "Invalid Password"
            })
        }

        const token = jwt.sign({
            id : user._id
        },process.env.JWT_SECRET)

        res.cookie("token",token)

        return res.status(200).json({
            message : "User LoggedIn Successfully",
            user : {
                id : user._id,
                username : user.username,
                email : user.email
            }
        })

    } catch(error){

        return res.status(500).json({
            message : "Something Went Wrong"
        })
    }
}


async function Profile(req,res){

    try {

        const {id} = req.user

        const user = await userModel.findById(id)

        if(!user){
            return res.status(404).json({
                message : "User Not Found"
            })
        }

        return res.status(200).json({
            user: {
                id : user._id,
                username : user.username,
                email: user.email
            }
        })

    } catch(error){

        return res.status(500).json({
            message : "Something Went Wrong"
        })
    }
}

async function LogOut(req,res){

     try{

        res.clearCookie("token")

        return res.status(200).json({
            message : "User Logged Out Successfully"
        })

    }catch(error){

        return res.status(500).json({
            message : "Something Went Wrong"
        })
    }
}

module.exports = {Signup , Login , Profile, LogOut}