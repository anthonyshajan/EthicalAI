import React, { useState, useRef, useEffect } from "react";
import { api } from "../api/client";

export default function LocalChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].map(m => 
        `${m.role === 'user' ? 'Student' : 'Helper'}: ${m.content}`
      ).join('\n\n');

      const response = await api.chat(input, conversationHistory);

      const assistantMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Oops, something went wrong. Can you try asking again?",
        timestamp: new Date().toISOString()
      }]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="border-b border-gray-200 p-6 bg-white shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Let's figure this out together 💡
        </h1>
        <p className="text-gray-700">I'm here to guide you, not give you answers</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
              <div className={`max-w-2xl ${message.role === 'user' ? 'order-2' : ''}`}>
                <div className={`p-4 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="animate-spin w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 p-4 bg-white shadow-lg">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What do you need help with?"
            className="flex-1 resize-none text-base p-3 border border-gray-300 rounded-lg"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 rounded-lg shadow-md disabled:opacity-50"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          Press Enter to send
        </p>
      </div>
    </div>
  );
}