import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, Send, Plus, User, Bot, Copy,
  Sidebar, X,
  FileText, Hash, Languages, Clock,
  LayoutDashboard,
} from 'lucide-react';
import { Message, ChatSession } from '../types';
import { storageUtils } from '../utils/storage';
import AudioPlayer from '../components/AudioPlayer';
import ChatSidebar from '../components/ChatSidebar';

const ChatGPTInterface: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [textInput, setTextInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [typing, setTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize app with stored data
  useEffect(() => {
    const sessions = storageUtils.getAllSessions();
    setChatSessions(sessions);

    const currentSessionId = storageUtils.getCurrentSessionId();
    if (currentSessionId) {
      const session = storageUtils.getSession(currentSessionId);
      if (session) {
        setCurrentSession(session);
      } else {
        // If stored session doesn't exist, create new one
        createNewChat();
      }
    } else {
      // No current session, create new one
      createNewChat();
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [textInput]);

  const createNewChat = () => {
    const newSession = storageUtils.createNewSession();
    setCurrentSession(newSession);
    storageUtils.saveSession(newSession);
    storageUtils.setCurrentSessionId(newSession.id);

    // Update sessions list
    const updatedSessions = storageUtils.getAllSessions();
    setChatSessions(updatedSessions);
  };

  const selectSession = (sessionId: string) => {
    const session = storageUtils.getSession(sessionId);
    if (session) {
      setCurrentSession(session);
      storageUtils.setCurrentSessionId(sessionId);
    }
  };

  const deleteSession = (sessionId: string) => {
    storageUtils.deleteSession(sessionId);
    const updatedSessions = storageUtils.getAllSessions();
    setChatSessions(updatedSessions);

    // If we deleted the current session, create a new one
    if (currentSession?.id === sessionId) {
      createNewChat();
    }
  };

  const updateCurrentSession = (updatedSession: ChatSession) => {
    setCurrentSession(updatedSession);
    storageUtils.saveSession(updatedSession);

    // Update sessions list
    const updatedSessions = storageUtils.getAllSessions();
    setChatSessions(updatedSessions);
  };

  const addMessage = (message: Message) => {
    if (!currentSession) return;

    const updatedMessages = [...currentSession.messages, message];
    const updatedSession: ChatSession = {
      ...currentSession,
      messages: updatedMessages,
      lastMessage: message.timestamp,
      title: updatedMessages.length === 2 ? storageUtils.generateSessionTitle(updatedMessages) : currentSession.title
    };

    updateCurrentSession(updatedSession);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !currentSession) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: 'user',
      type: 'text',
      content: textInput,
      timestamp: new Date()
    };

    addMessage(newMessage);
    setTextInput('');
    setTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        type: 'text',
        content: `I understand you're asking about "${newMessage.content}". Let me help you with that.`,
        timestamp: new Date()
      };
      addMessage(botResponse);
      setTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit(e);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);

    mediaRecorderRef.current!.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      await sendAudioToBackend(audioBlob);
    };
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await sendAudioToBackend(file);
    }
  };

  const sendAudioToBackend = async (audioFile: Blob) => {
    if (!currentSession) return;

    const audioUrl = URL.createObjectURL(audioFile);
    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      type: 'audio',
      content: audioUrl,
      timestamp: new Date()
    };

    addMessage(userMessage);
    setTyping(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile, 'audio.wav');

      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/voice-chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to fetch audio reply');

      const data = await response.json();
      const backendAudioUrl = `http://localhost:5000${data.audio_url}`;

      const botResponse: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        type: 'audio-response',
        content: backendAudioUrl,
        timestamp: new Date(),
        matchedSections: data.matched_sections || [],
        translatedTexts: data.translated_texts || []
      };

      addMessage(botResponse);
    } catch (error) {
      console.error('Backend error:', error);
      const errorMessage: Message = {
        id: Date.now() + 2,
        sender: 'bot',
        type: 'text',
        content: 'Sorry, there was an error processing your audio.',
        timestamp: new Date()
      };
      addMessage(errorMessage);
    } finally {
      setTyping(false);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (msg: Message) => {
    switch (msg.type) {
      case 'text':
        return (
          <div className="prose prose-sm max-w-none">
            <p className="mb-0 whitespace-pre-wrap">{msg.content}</p>
          </div>
        );

      case 'audio':
        return <AudioPlayer audioUrl={msg.content} />;

      case 'audio-response':
        return (
          <div className="space-y-4">
            <AudioPlayer audioUrl={msg.content} />

            {msg.matchedSections && msg.matchedSections.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Matched Sections ({msg.matchedSections.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {msg.matchedSections.map((section, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full font-medium"
                    >
                      Section {section}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {msg.translatedTexts && msg.translatedTexts.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Languages className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Translated Content
                  </span>
                </div>
                <div className="space-y-3">
                  {msg.translatedTexts.map((text, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              Section {msg.matchedSections?.[index] || index + 1}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                            {text}
                          </p>
                        </div>
                        <button
                          onClick={() => copyMessage(text)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-2"
                        >
                          <Copy className="h-3 w-3 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        darkMode={darkMode}
        chatSessions={chatSessions}
        currentSessionId={currentSession.id}
        onNewChat={createNewChat}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        formatTime={formatTime}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Sidebar className="h-5 w-5" />}
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {currentSession.title}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Dashboard</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            {currentSession.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-600 ml-3' : 'bg-gray-600 mr-3'}`}>
                    {msg.sender === 'user' ?
                      <User className="h-5 w-5 text-white" /> :
                      <Bot className="h-5 w-5 text-white" />
                    }
                  </div>

                  <div className={`group relative ${msg.sender === 'user' ? 'mr-3' : 'ml-3'}`}>
                    <div className={`${msg.type === 'text' ? 'p-4 rounded-2xl' : 'p-3 rounded-xl'} ${msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
                      {renderMessage(msg)}
                    </div>

                    <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                      </div>
                      {msg.type === 'text' && (
                        <button
                          onClick={() => copyMessage(msg.content)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Copy className="h-3 w-3 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleTextSubmit} className="flex items-end space-x-3">
              <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                className={`p-3 rounded-full transition-colors ${recording
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
              >
                <Mic className={`h-5 w-5 ${recording ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`} />
              </button>

              <input
                type="file"
                accept="audio/*"
                hidden
                id="audio-upload"
                onChange={handleAudioUpload}
              />
              <label htmlFor="audio-upload" className="p-3 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 cursor-pointer transition-colors">
                <Plus className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </label>

              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[48px] max-h-32"
                  placeholder="Type your message or upload audio..."
                  rows={1}
                />
              </div>

              <button
                type="submit"
                disabled={!textInput.trim()}
                className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-colors"
              >
                <Send className="h-5 w-5 text-white" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatGPTInterface;