const jwt = require('jsonwebtoken');
const userModel = require('../model/user.model');

async function authUser(req,res,next){
    // token check  karo 
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message:"Unauthorized user, login first"});
    }

    //check if token right 
    try{
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        const user = await userModel.findOne({_id: decoded._id});

        req.user = user;
        next();

    }catch(err){
        return res.status(401).json({message:"Invalid token, login first"})
    }
}

module.exports = { authUser };