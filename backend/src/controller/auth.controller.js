const userModel = require("../model/user.model")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function register(req,res){
    const { firstname , lastname, email, password } = req.body;

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
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // REQUIRED on HTTPS (Render)
      sameSite: "none", // safest option
    });

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
    res.cookie("token",token, {
      httpOnly: true,
      secure: true, // REQUIRED on HTTPS (Render)
      sameSite: "none", // safest option
    });

    return res.status(201).json({message:"logged in successfull"})
} 

async function logout(req,res){
    res.clearCookie("token");
    return res.status(200).json({message:"Logged out successfully"});
}

async function checkAuth(req, res) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({ user: decoded });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = {
    register,
    login,
    logout,
    checkAuth
}