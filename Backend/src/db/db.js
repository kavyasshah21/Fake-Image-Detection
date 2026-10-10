const mongoose = require("mongoose")

async function connectDB(){
    try{
       await mongoose.connect(process.env.MONGO_URI)
        console.log("Database Connected successfully")

    }catch(error){
        console.log("Error Occuring",error)
        throw error
    }  
}


module.exports = connectDB