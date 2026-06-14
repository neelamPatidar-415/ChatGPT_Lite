import React from 'react';
import './ChatSideBar.css';


const ChatSidebar = ({ chats, activeChatId, onSelectChat, onNewChat, open }) => {

  return (
    <aside className={"chat-sidebar " + (open ? 'open' : '')} aria-label="Previous chats">
      <div className="sidebar-header">
        <h2>Chats</h2>
        <button className="small-btn" onClick={onNewChat}>New</button>
      </div>
      <nav className="chat-list" aria-live="polite">
        {chats.map(c => {
          const chatId = c.id || c._id;
          return (
            <button
              key={chatId}
              className={
                "chat-list-item " + (chatId === activeChatId ? "active" : "")
              }
              onClick={() => {
                onSelectChat(c._id);
                onClose && onClose(); // CLOSE SIDEBAR AFTER CLICK
              }}
            >
              <span className="title-line">{c.title}</span>
            </button>
          );
        })}
        {chats.length === 0 && <p className="empty-hint">No chats yet.</p>}
      </nav>
    </aside>
  );
};

export default ChatSidebar;