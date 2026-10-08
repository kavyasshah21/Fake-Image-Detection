const mongoose = require("mongoose")

const imageSchema = new mongoose.Schema({

    imageUrl: {
        type: String,
        required : true
    },

    fileId : {
    type : String,
    required : true
},

    fileName : {
        type : String,
        required : true
    },

    user :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"

    } 
},
{
    timestamps : true
})

const imageModel = mongoose.model("image", imageSchema)

module.exports = imageModel