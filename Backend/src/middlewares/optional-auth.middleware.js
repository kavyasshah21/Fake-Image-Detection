const jwt = require("jsonwebtoken")

async function optionalAuth(req,res,next){

    const token = req.cookies.token

    if(!token){
        return next()
    }
    try{
    const decoded = jwt.verify(token , process.env.JWT_SECRET)

    req.user = decoded

    next()

    }catch(error){
        return res.status(401).json({
            message : "Unauthorized"
        })
    }
}
module.exports = {optionalAuth}