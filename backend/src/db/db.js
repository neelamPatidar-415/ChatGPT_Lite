const mongoose = require('mongoose');

function connectDb(){
    try{
        mongoose.connect(process.env.MONGO_URI)
        .then(()=>{
            console.log("Connect to db");
        })
    }catch(err){
        console.log("Error connecting to db: ",err);
    }
}

module.exports = connectDb;