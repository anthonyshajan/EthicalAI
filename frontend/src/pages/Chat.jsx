import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../api/firebase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Paperclip, MessageSquare, Plus, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { API_URL } from '../config/api';

export default function Chat() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI learning buddy. I'll help you learn and improve, but I'll never do your work for you. What would you like help with?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('userId', '==', currentUser.uid),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    
    try {
      await deleteDoc(doc(db, 'conversations', conversationId));
      
      if (currentConversationId === conversationId) {
        createNewConversation();
      }
      
      await loadConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Error deleting conversation. Please try again.');
    }
  };

  const createNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm your AI learning buddy. I'll help you learn and improve, but I'll never do your work for you. What would you like help with?"
      }
    ]);
    setAttachedFile(null);
  };

  const loadConversation = (conversation) => {
    setCurrentConversationId(conversation.id);
    setMessages(conversation.messages || []);
  };

  const generateSimpleTitle = (message) => {
    // Simple fallback title generation
    const cleaned = message.replace(/[^\w\s]/g, '').trim();
    const words = cleaned.split(' ').slice(0, 6);
    return words.join(' ').substring(0, 50);
  };

  const saveConversation = async (updatedMessages) => {
    try {
      const firstUserMessage = updatedMessages.find(m => m.role === 'user')?.content || 'New Chat';
      const title = generateSimpleTitle(firstUserMessage);
      
      const conversationData = {
        userId: currentUser.uid,
        messages: updatedMessages,
        title: title,
        updatedAt: serverTimestamp()
      };

      if (currentConversationId) {
        await updateDoc(doc(db, 'conversations', currentConversationId), conversationData);
      } else {
        const docRef = await addDoc(collection(db, 'conversations'), {
          ...conversationData,
          createdAt: serverTimestamp()
        });
        setCurrentConversationId(docRef.id);
      }
      
      await loadConversations();
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const simulateStreaming = async (text, callback) => {
    const words = text.split(' ');
    let current = '';
    
    for (let i = 0; i < words.length; i++) {
      current += (i > 0 ? ' ' : '') + words[i];
      callback(current);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !attachedFile) || loading) return;

    let userMessageContent = input.trim();
    if (attachedFile) {
      userMessageContent += `\n\n[Attached file: ${attachedFile.name}]`;
    }

    const userMessage = { role: 'user', content: userMessageContent };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setAttachedFile(null);
    setLoading(true);
    setStreamingText('');

    try {
      if (attachedFile) {
        const formData = new FormData();
        formData.append('file', attachedFile);
        formData.append('message', input.trim());
        
        const response = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        await simulateStreaming(data.response, (partial) => {
          setStreamingText(partial);
        });
        
        const assistantMessage = { role: 'assistant', content: data.response };
        const finalMessages = [...newMessages, assistantMessage];
        setMessages(finalMessages);
        setStreamingText('');
        
        await saveConversation(finalMessages);
      } else {
        const response = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessageContent })
        });

        const data = await response.json();
        
        await simulateStreaming(data.response, (partial) => {
          setStreamingText(partial);
        });
        
        const assistantMessage = { role: 'assistant', content: data.response };
        const finalMessages = [...newMessages, assistantMessage];
        setMessages(finalMessages);
        setStreamingText('');
        
        await saveConversation(finalMessages);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      setStreamingText('');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="flex h-full">
        {/* Chat History Sidebar */}
        <div className="w-64 border-r bg-gray-50 flex flex-col">
          <div className="p-4 border-b bg-white">
            <Button
              onClick={createNewConversation}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Recent Chats</h3>
            {conversations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No chat history yet</p>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group relative rounded-lg hover:bg-white transition ${
                      currentConversationId === conv.id ? 'bg-white shadow-sm' : ''
                    }`}
                  >
                    <button
                      onClick={() => loadConversation(conv)}
                      className="w-full text-left p-3 pr-10"
                    >
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conv.title || 'New Chat'}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatDate(conv.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b bg-white">
            <h1 className="text-2xl font-bold text-gray-900">Ask AI for Help</h1>
            <p className="text-gray-600">Get guidance and hints, not answers</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-200'
                  } rounded-lg shadow-sm`}>
                    <div className="p-4">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                    {streamingText ? (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{streamingText}</p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">Analyzing your question...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t bg-white p-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-3">
                {attachedFile && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-900">{attachedFile.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachedFile(null)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Remove
                    </Button>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileAttach}
                    className="hidden"
                    accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="px-3"
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about your coursework... (Press Enter to send, Shift+Enter for new line)"
                    className="flex-1 resize-none"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <Button 
                    type="submit" 
                    disabled={loading || (!input.trim() && !attachedFile)}
                    className="bg-blue-600 hover:bg-blue-700 h-auto px-6"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
