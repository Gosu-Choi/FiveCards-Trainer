import React, { useState } from 'react';

const handleSendMessage = async (message) => {
  const res = await fetch('/api/bot-help', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    });
  const data = await res.json();
  if (res.status === 500){
    return data.details;
  } else {
    return data.response;
  }
}

const ChatMessage = ({ message, role }) => (
    <div className={`chat-message ${role==="assistant" ? 'bot-message' : 'user-message'}`}>
      {message}
    </div>
  );

const ChatBot = ({ closeModal, chatContext, modalIndex, ments }) => {
  console.log(ments);
  console.log(modalIndex);
  const [messages, setMessages] = useState([{ content: chatContext, role: "assistant" }]);
  const [userInput, setUserInput] = useState('');

  const handleManageMessage = async () => {
    if (userInput.trim()) {
      const newMessages = [...messages, { content: userInput.concat(" Please give me your answer for essential 3-4 sentences."), role: "user" }];
      setMessages(newMessages);
      setUserInput('');

      const help = await handleSendMessage([{content: ments[modalIndex], role: "user"}, ...newMessages]);
      setMessages((prevMessages) => [...prevMessages, { content: help, role: "assistant" }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleManageMessage();
    }
  };

  return (
    <div className="chat-bot">
      <div className="chat-header">
        <span>Chat with Bot {modalIndex}</span>
        <button onClick={closeModal} className="close-button">&times;</button>
      </div>
      <div className="chat-body">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message.content} role={message.role} />
        ))}
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={handleManageMessage} className="send-button">Send</button>
      </div>
    </div>
  );
};

export default ChatBot;