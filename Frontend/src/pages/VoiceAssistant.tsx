import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, Send, Plus, MessageSquare, Settings, User, Bot, Copy,
  MoreHorizontal, Moon, Sun, Sidebar, X, Play, Pause, Volume2,
  FileText, Hash, Languages, Clock, Download
} from 'lucide-react';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  type: 'text' | 'audio' | 'audio-response';
  content: string;
  timestamp: Date;
  // Additional fields for audio responses
  matchedSections?: string[];
  translatedTexts?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: Date;
}

interface AudioPlayerProps {
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, onTimeUpdate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadAudio = () => {
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'audio.mp3';
    a.click();
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg border border-blue-200 dark:border-gray-600">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center space-x-4">
        <button
          onClick={togglePlayPause}
          className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 text-white" />
          ) : (
            <Play className="h-5 w-5 text-white ml-0.5" />
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div
            className="h-2 bg-gray-200 dark:bg-gray-500 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-150"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-gray-200 dark:bg-gray-500 rounded-lg appearance-none cursor-pointer"
          />
          <button
            onClick={downloadAudio}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatGPTInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      type: 'text',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [textInput, setTextInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [typing, setTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatSessions] = useState<ChatSession[]>([
    { id: '1', title: 'General Conversation', lastMessage: new Date() },
    { id: '2', title: 'JavaScript Help', lastMessage: new Date(Date.now() - 3600000) },
    { id: '3', title: 'React Components', lastMessage: new Date(Date.now() - 7200000) },
  ]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [textInput]);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: 'user',
      type: 'text',
      content: textInput,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, newMessage]);
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
      setMessages((prev) => [...prev, botResponse]);
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
  useEffect(() => {
    const storedMessages = localStorage.getItem('chat_messages');
    if (storedMessages) {
      const parsedMessages = JSON.parse(storedMessages);
      // Restore Date objects from string

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messagesWithDates = parsedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      setMessages(messagesWithDates);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  }, [messages]);

  const sendAudioToBackend = async (audioFile: Blob) => {
    const audioUrl = URL.createObjectURL(audioFile);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'user',
        type: 'audio',
        content: audioUrl,
        timestamp: new Date()
      }
    ]);

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

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          type: 'audio-response',
          content: backendAudioUrl,
          timestamp: new Date(),
          matchedSections: data.matched_sections || [],
          translatedTexts: data.translated_texts || []
        }
      ]);
    } catch (error) {
      console.error('Backend error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: 'bot',
          type: 'text',
          content: 'Sorry, there was an error processing your audio.',
          timestamp: new Date()
        }
      ]);
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
                    IPC Sections and their Punishments
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

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-gray-900 text-white flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={() => { }}
            className="w-full flex items-center space-x-2 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chatSessions.map((session) => (
            <div key={session.id} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.title}</p>
                <p className="text-xs text-gray-400">{formatTime(session.lastMessage)}</p>
              </div>
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-700 space-y-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="w-full flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

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
              Legal AI Assistant
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            {messages.map((msg) => (
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