const mongoose = require('mongoose');
const { applyTimestamps } = require('./user.model');

const chatSchema = mongoose.Schema({
    title:{
        type:String,
        required: true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required: true
    },
    lastUpdate:{
        type:Date,
        default: Date.now
    }
},{
    Timestamps: true
})

const chatModel = mongoose.model("chat",chatSchema);

module.exports = chatModel;