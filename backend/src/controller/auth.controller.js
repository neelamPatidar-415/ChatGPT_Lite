const userModel = require("../model/user.model")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function register(req,res){
    const { fullname:{firstname , lastname}, email, password } = req.body;

    const userExist = await userModel.findOne({email:email});
    if(userExist){
        return res.status(400).json({ message:"User already exist, try login"});
    }

    const user = await userModel.create({
        fullname:{firstname, lastname},
        email,
        password : await bcrypt.hash(password,10)
    });
    //token set karo
    const token = jwt.sign({_id:user._id},process.env.JWT_SECRET);
    res.cookie("token",token);

    return res.status(201).json({message:"User created successfully"})
} 

async function login(req,res){
    const {email, password} = req.body;

    const user = await userModel.findOne({email});
    if(!user){
        return res.status(401).json({message:"Email or Password wrong"});
    }

    //check password 
    const passwordCheck = await bcrypt.compare(password, user.password);
    if(!passwordCheck){
        return res.status(401).json({message:"Email or Password wrong"});
    }

    const token = jwt.sign({_id:user._id},process.env.JWT_SECRET);
    res.cookie("token",token);

    return res.status(201).json({message:"logged in successfull"})
} 

module.exports = {
    register,
    login,
}