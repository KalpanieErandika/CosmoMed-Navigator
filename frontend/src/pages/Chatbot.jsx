import React, { useState, useRef, useEffect } from 'react';
import { RiCloseLargeFill } from 'react-icons/ri';
import { IoSend } from 'react-icons/io5';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { text: "Hi! How can I help you?", sender: "bot" },
  ]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom(); }, [messages, loading]);

const handleSubmit = async (e) => {
  e.preventDefault();//stop page reload
  if (!inputText.trim()) return;

  const userMessage = { text: inputText, sender: "user" };
  setMessages(prev => [...prev, userMessage]);
  setInputText('');
  setLoading(true);

  try {
    const res = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: inputText }),
    });

    const data = await res.json();

    let botReply;

    if (res.ok) {
      botReply = data?.response || 'Sorry, I could not understand that.';
    } else {
      botReply = `Error contacting Gemini API:\nStatus: ${data.status || res.status}\nMessage: ${data.body || data.message}`;
    }
    setMessages(prev => [...prev, { text: botReply, sender: "bot" }]);

  } catch (err) {
    setMessages(prev => [...prev, { text: `Network error: ${err.message}`, sender: "bot" }]);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
      {isOpen && (
        <div className="bg-gradient-to-br from-white to-yellow-100 w-80 h-[480px] rounded-xl shadow-2xl flex flex-col">

          <div className="bg-cyan-800 w-full flex justify-between items-center text-white px-3 py-2 rounded-t-xl mb-2">
            <h4 className="font-bold text-lg">AI Chatbot</h4>


            <button onClick={() => setIsOpen(false)} className="text-white hover:text-red-500 cursor-pointer">
            <RiCloseLargeFill size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4"> {/*messages area*/}
            {messages.map((msg, idx) => (
              <p key={idx} className={`text-sm p-2 my-2 w-3/4 ${
                msg.sender === 'bot'
                  ? 'bg-gray-200 text-black rounded-tl-xl rounded-tr-xl rounded-br-xl'
                  : 'bg-cyan-600 text-white ml-auto rounded-tl-xl rounded-tr-xl rounded-bl-xl'}`}>
                {msg.text}
              </p>
            ))}

            {loading && (
              <div className="bg-gray-200 rounded-tl-xl rounded-tr-xl rounded-br-xl p-2 text-sm w-20 flex space-x-1">
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>


          <form onSubmit={handleSubmit} className="flex px-4 shadow-md rounded-b-3xl">
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Message..."
className="flex-1 border border-gray-300 rounded-l-xl px-3 mb-3 py-2 text-sm focus:outline-none text-black" required/>
            <button type="submit" className="bg-cyan-800 hover:bg-cyan-900 text-white px-3 rounded mb-3 py-2">
           <IoSend />
            </button>
          </form>
        </div>
      )}

    <button onClick={() => setIsOpen(!isOpen)} className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded shadow-lg">
        AI Chatbot
      </button>
    </div>
  );
};

export default Chatbot;
