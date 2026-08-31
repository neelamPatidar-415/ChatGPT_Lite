import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import ChatMobileBar from '../components/chat/ChatMobileBar.jsx';
import ChatSidebar from '../components/chat/ChatSideBar.jsx';
import ChatMessages from '../components/chat/ChatMessages.jsx';
import ChatComposer from '../components/chat/ChatComposer.jsx';
import '../components/chat/ChatLayout.css';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import {
  ensureInitialChat,
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,
  setChats
} from '../store/ChatSlice.js';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const chats = useSelector((state) => state.chat.chats);
  const activeChatId = useSelector((state) => state.chat.activeChatId);
  const input = useSelector((state) => state.chat.input);
  const isSending = useSelector((state) => state.chat.isSending);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Init: auth → chats → socket
  useEffect(() => {
    const initApp = async () => {
      try {
        await axios.get("https://chatgpt-lite-xu4t.onrender.com/api/auth/me", {
          withCredentials: true,
        });

        setIsLoggedIn(true);

        const response = await axios.get("https://chatgpt-lite-xu4t.onrender.com/api/chat", {
          withCredentials: true,
        });

        const fetched = (response.data.chats || []).slice().reverse();

        if (fetched.length > 0) {
          dispatch(setChats(fetched));
          dispatch(selectChat(fetched[0]._id));
          getMessages(fetched[0]._id);
        } else {
          dispatch(setChats([]));
          setMessages([]);
        }

        const tempSocket = io("https://chatgpt-lite-xu4t.onrender.com/", {
          withCredentials: true,
        });

        tempSocket.on("ai-response", (messagePayload) => {
          setMessages((prev) => [
            ...prev,
            { type: "ai", content: messagePayload.content }
          ]);

          dispatch(sendingFinished());
        });

        setSocket(tempSocket);

      } catch (err) {
        setIsLoggedIn(false);
        dispatch(setChats([]));
        setMessages([]);
        console.log("User not authenticated");
      }
    };

    initApp();
  }, []);

  // Send message (auto-create chat if needed)
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    dispatch(sendingStarted());

    setMessages((prev) => [
      ...prev,
      { type: "user", content: trimmed }
    ]);

    dispatch(setInput(""));

    let chatId = activeChatId;

    try {
      if (!chatId || chatId.length !== 24) {
        const res = await axios.post(
          "https://chatgpt-lite-xu4t.onrender.com/api/chat",
          { title: trimmed.slice(0, 20) || "New Chat" },
          { withCredentials: true }
        );

        const newChat = res.data.chat;

        dispatch(startNewChat(newChat));
        dispatch(selectChat(newChat._id));

        chatId = newChat._id;
      }

      socket.emit("ai-message", {
        chat: chatId,
        content: trimmed,
      });

    } catch (err) {
      console.error("Error creating chat:", err);
      dispatch(sendingFinished());
    }
  };

  // Fetch messages
  const getMessages = async (chatId) => {
    if (!chatId || chatId.length !== 24) {
      setMessages([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://chatgpt-lite-xu4t.onrender.com/api/chat/messages/${chatId}`,
        { withCredentials: true }
      );

      setMessages(
        response.data.messages.map((m) => ({
          type: m.role === "user" ? "user" : "ai",
          content: m.content,
        }))
      );

    } catch (err) {
      console.error("Failed to fetch messages", err);
      setMessages([]);
    }
  };

  // Create new chat
  const handleNewChat = async () => {
    try {
      await axios.get("https://chatgpt-lite-xu4t.onrender.com/api/auth/me", {
        withCredentials: true,
      });

      let title = window.prompt("Enter a title for the new chat:", "");
      if (title) title = title.trim();

      if (!title) {
        alert("Chat title is required");
        return;
      }

      const res = await axios.post(
        "https://chatgpt-lite-xu4t.onrender.com/api/chat",
        { title },
        { withCredentials: true }
      );

      const newChat = res.data.chat;

      dispatch(startNewChat(newChat));
      dispatch(selectChat(newChat._id));
      setMessages([]);

    } catch (err) {
      console.error("Failed to create chat", err);

      if (err.response?.status === 401) {
        alert("You need to login first");
        navigate("/login");
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };

  const handleLogin = () => navigate("/login");

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://chatgpt-lite-xu4t.onrender.com/api/auth/logout", 
        {}, 
        { withCredentials: true } 
      ); 
 
      setIsLoggedIn(false); 
      window.location.reload(); 
 
    } catch (err) { 
      console.error("Logout failed", err); 
    } 
  }; 
 
  return ( 
    <div className="chat-layout"> 
      <div className="chat-body"> 
 
        <ChatSidebar 
          chats={chats} 
          activeChatId={activeChatId} 
          onSelectChat={(id) => { 
            dispatch(selectChat(id)); 
            getMessages(id); 
          }} 
          onNewChat={handleNewChat} 
          onClose={() => setSidebarOpen(false)} 
          open={sidebarOpen} 
        /> 
 
        {sidebarOpen && ( 
          <button 
            className="sidebar-backdrop" 
            onClick={() => setSidebarOpen(false)} 
          /> 
        )} 
 
        <div className="chat-panel"> 
          <div className="top-navbar"> 
            <button 
              className="menu-btn" 
              onClick={() => setSidebarOpen(true)} 
            > 
              ☰ 
            </button> 
 
            <div className="nav-title">ChatGPT Lite</div> 
 
            <div className="nav-actions"> 
              {isLoggedIn ? ( 
                <button onClick={handleLogout}>Logout</button> 
              ) : ( 
                <button onClick={handleLogin}>Login</button> 
              )} 
            </div> 
          </div> 
 
          <main className="chat-main"> 
            {messages.length === 0 && ( 
              <div className="chat-welcome"> 
                <h1>ChatGPT Lite</h1> 
                <p>Your AI assistant is live and ready to go.</p> 
                <p> 
                  Built by a learner, for learners—go ahead, explore, break 
                  things, and see what it can do. 
                </p> 
                <p>Try asking something and feel the vibe.</p> 
              </div> 
            )} 
 
            <ChatMessages messages={messages} isSending={isSending} /> 
 
            <ChatComposer 
              input={input} 
              setInput={(v) => dispatch(setInput(v))} 
              onSend={sendMessage} 
              isSending={isSending} 
            /> 
          </main> 
        </div> 
 
      </div> 
    </div> 
  ); 
}; 
 
export default Home; 