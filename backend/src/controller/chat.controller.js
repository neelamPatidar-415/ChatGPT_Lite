const chatModel = require("../model/chat.model");

async function chatController(req,res){
    const { title } = req.body;

    const chat = await chatModel.create({
        title,
        user:req.user._id
    })

    console.log("Here is created post :",chat);
    return res.status(201).json({
        message:"chat created successfully"
    })
}

module.exports = chatController;