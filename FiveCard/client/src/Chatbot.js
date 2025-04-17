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

const ChatBot = ({ closeModal, chatContext, modalIndex, ments, language }) => { // ments should be used.

  const [messages, setMessages] = useState([{ content: ments[modalIndex], role: "user" }, { content: chatContext, role: "assistant" }]);
  const [visualmessages, setVisualmessages] = useState([{ content: chatContext, role: "assistant" }]);
  const [userInput, setUserInput] = useState('');

  const handleManageMessage = async () => {
    if (userInput.trim()) {
      const newMessages = [...messages, { content: userInput, role: "user" }];
      const newvisualMessages = [...visualmessages, { content: userInput, role: "user" }];
      setVisualmessages(newvisualMessages);
      setMessages(newMessages);
      setUserInput('');
  
      const help = await handleSendMessage([...messages, { content: userInput.concat(" Please give me your answer for essential 3-4 sentences in .").concat(language), role: "user" }]);
  
      setMessages((prevMessages) => [...prevMessages, { content: help, role: "assistant" }]);
      setVisualmessages((prevVisualMessages) => [...prevVisualMessages, { content: help, role: "assistant" }]);
      console.log("chatContext:", chatContext)
      console.log("ments:", ments)
      console.log("messages:", [...messages, { content: `"${userInput}" This is player 0's question. Please give me your answer for essential 3-4 sentences in `.concat(language), role: "user" }])
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
        {visualmessages.map((message, index) => (
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