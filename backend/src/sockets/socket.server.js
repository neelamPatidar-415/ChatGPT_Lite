
////////////////////////////////////////////

const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const userModel = require("../model/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../model/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer){
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            allowedHeaders: [ "Content-Type", "Authorization" ],
            credentials: true
        }
    })

    //auth middleware
    io.use(async(socket,next) =>{
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

        if(!cookies.token){
            next(new Error("Authentication Error : No token provided"));   ///yaha error bhi next me bhej rhe he 
        }

        try{
            const decoded = jwt.verify(cookies.token,process.env.JWT_SECRET);

            const user = await userModel.findById(decoded._id);
            socket.user = user;

            next();
        } catch(err){
            next(new Error("Authentication Error : Invalid token"));
        }
    })

    //ai-message and connection event
    io.on("connection",(socket)=>{

        socket.on("ai-message",async (messagePayLoad) => {
            // console.log("Full payload data : ", messagePayLoad);
            // messagePayLoad = { chat: chat._id, content: text message }
            // look it was not working without converting so json to obj me convert kiya pehle , actually postman pe json select karo then sb set he iski need nhi hogi
            // messagePayLoad = JSON.parse(messagePayLoad);, metadata

            // console.log("Payload content:", messagePayLoad.content);

            const [message, vectors] = await Promise.all([
                messageModel.create({
                    chat:messagePayLoad.chat,
                    user:socket.user._id,
                    content:messagePayLoad.content,
                    role:"user"
                }),

                aiService.generateVector(messagePayLoad.content)
            ])

            ///⭐⭐⭐⭐Optimization point : 
            //before creating memory at pinecone for that particular que , make a query first to get ans , then save que

            await createMemory({
                vectors: vectors,
                metadata:{
                    chat:messagePayLoad.chat,
                    user:socket.user._id,
                    text:messagePayLoad.content
                },
                messageId: message._id
            })

            const [vectorMemoResponse, chatHistoryforSTM] = await Promise.all([
                queryMemory({
                    queryVector:vectors,
                    metadata:{
                        user: socket.user._id
                    },
                }),
                messageModel.find({
                    chat:messagePayLoad.chat,
                }).sort({createdAt: -1}).limit(5).lean().then(messages => messages.reverse())

            ])

            console.log("Here are memory by query at pinecone ",vectorMemoResponse);
            console.log("Here is memory by DB for that particular chat",chatHistoryforSTM);

            const stm = chatHistoryforSTM.map(item => {
                return {
                    role: item.role,
                    parts : [ { text: item.content}]
                }
            })

            const ltm = [
                {
                    role:"user",
                    parts : [{
                        text:`
                        Hey , here are some previous messages from the chat , use them to generate most appropriate answer
                        ${vectorMemoResponse.map(item => item.metadata.text).join("\n")}
                        `
                    }]
                }
            ]

            const response = await aiService.generateResponse([...ltm, ...stm]);
            socket.emit("ai-response",{
                content: response,
                chat:messagePayLoad.chat
            });

            const [responseDb, responseVectors] = await Promise.all([
                messageModel.create({
                    chat:messagePayLoad.chat,
                    user:socket.user._id,
                    content:response,
                    role:"model"
                }),
                aiService.generateVector(response)
            ])

            await createMemory({
                vectors: responseVectors,
                metadata:{
                    chat:messagePayLoad.chat,
                    user:socket.user._id,
                    text:response
                },
                messageId: responseDb._id
            })

        })
    })

}

module.exports = initSocketServer;
