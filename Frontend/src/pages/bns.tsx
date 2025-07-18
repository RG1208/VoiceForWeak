/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mic, Send, Plus, User, Bot, Copy,
    Sidebar, X,
    FileText, Hash, Languages, Clock,
    LayoutDashboard, Volume2, Trash2,
    ChevronDown, LogOut,
    X as Cross, Edit3, RefreshCw,
} from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer';
import ChatSidebar from '../components/ChatSidebar';
import type { Message } from '../types';
import { bnsStorageUtils } from '../utils/bnsStorage';

interface AttachedAudio {
    file: Blob;
    url: string;
    name: string;
    duration?: number;
    base64?: string; // Added for base64 storage
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    lastMessage: Date;
}

const BSNSections: React.FC = () => {
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [textInput, setTextInput] = useState('');
    const [attachedAudio, setAttachedAudio] = useState<AttachedAudio | null>(null);
    const [recording, setRecording] = useState(false);
    const [typing, setTyping] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Add state for editing
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [editAudio, setEditAudio] = useState<AttachedAudio | null>(null);
    const [, setCancelBot] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const navigate = useNavigate();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [username, setUsername] = useState('User');

    useEffect(() => {
        const storedName = localStorage.getItem('name');
        if (storedName) setUsername(storedName);
    }, []);

    // Utility: Convert Blob to base64
    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // Utility: Convert base64 to Blob
    const base64ToBlob = (base64: string): Blob => {
        const arr = base64.split(',');
        const match = arr[0].match(/:(.*?);/);
        if (!match) {
            throw new Error('Invalid base64 string');
        }
        const mime = match[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    // On load, reconstruct blob URLs for user audio messages with audioBase64
    useEffect(() => {
        setChatSessions((sessions: ChatSession[]) =>
            sessions.map((session: ChatSession) => ({
                ...session,
                messages: session.messages.map((msg: Message) => {
                    if (
                        msg.sender === 'user' &&
                        (msg.type === 'audio' || msg.type === 'combined') &&
                        msg.audioBase64 &&
                        !msg.audioUrl
                    ) {
                        const blob = base64ToBlob(msg.audioBase64);
                        const url = URL.createObjectURL(blob);
                        return { ...msg, audioUrl: url };
                    }
                    return msg;
                }),
            }))
        );
    }, []);

    useEffect(() => {
        if (!currentSession) return;
        // Reconstruct blob URLs for user audio messages
        const updatedMessages = currentSession.messages.map((msg: Message) => {
            if (
                msg.sender === 'user' &&
                (msg.type === 'audio' || msg.type === 'combined') &&
                msg.audioBase64 &&
                !msg.audioUrl
            ) {
                const blob = base64ToBlob(msg.audioBase64);
                const url = URL.createObjectURL(blob);
                return { ...msg, audioUrl: url };
            }
            return msg;
        });
        if (updatedMessages.some((m, i) => m !== currentSession.messages[i])) {
            setCurrentSession({ ...currentSession, messages: updatedMessages });
        }
    }, [currentSession]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('name');
        navigate('/login');
    };

    // Initialize app with stored data
    useEffect(() => {
        const sessions = bnsStorageUtils.getAllSessions();
        setChatSessions(sessions);

        const currentSessionId = bnsStorageUtils.getCurrentSessionId();
        if (currentSessionId) {
            const session = bnsStorageUtils.getSession(currentSessionId);
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

    // Save dark mode preference and apply to document
    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));

        // Apply dark mode to the document element
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
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

    const toggleDarkMode = () => {
        setDarkMode((prev: any) => !prev);
    };

    const createNewChat = () => {
        const newSession = bnsStorageUtils.createNewSession();
        setCurrentSession(newSession);
        bnsStorageUtils.saveSession(newSession);
        bnsStorageUtils.setCurrentSessionId(newSession.id);

        // Update sessions list
        const updatedSessions = bnsStorageUtils.getAllSessions();
        setChatSessions(updatedSessions);
    };

    const selectSession = (sessionId: string) => {
        const session = bnsStorageUtils.getSession(sessionId);
        if (session) {
            setCurrentSession(session);
            bnsStorageUtils.setCurrentSessionId(sessionId);
        }
    };

    const deleteSession = (sessionId: string) => {
        bnsStorageUtils.deleteSession(sessionId);
        const updatedSessions = bnsStorageUtils.getAllSessions();
        setChatSessions(updatedSessions);

        // If we deleted the current session, create a new one
        if (currentSession?.id === sessionId) {
            createNewChat();
        }
    };

    const renameSession = (sessionId: string, newTitle: string) => {
        const session = bnsStorageUtils.getSession(sessionId);
        if (session) {
            const updatedSession = { ...session, title: newTitle };
            bnsStorageUtils.saveSession(updatedSession);

            // Update sessions list
            const updatedSessions = bnsStorageUtils.getAllSessions();
            setChatSessions(updatedSessions);

            // Update current session if it's the one being renamed
            if (currentSession?.id === sessionId) {
                setCurrentSession(updatedSession);
            }
        }
    };

    // const updateCurrentSession = (updatedSession: ChatSession) => {
    //   setCurrentSession(updatedSession);
    //   storageUtils.saveSession(updatedSession);

    //   // Update sessions list
    //   const updatedSessions = storageUtils.getAllSessions();
    //   setChatSessions(updatedSessions);
    // };

    const addMessage = (message: Message) => {
        setCurrentSession((prevSession: ChatSession | null) => {
            if (!prevSession) return null;
            if (prevSession.messages.some((m: Message) => m.id === message.id)) return prevSession;
            const updatedMessage = { ...message };
            if (
                message.sender === 'user' &&
                (message.type === 'audio' || message.type === 'combined') &&
                attachedAudio?.base64
            ) {
                updatedMessage.audioBase64 = attachedAudio.base64;
            }
            const updatedMessages = [...prevSession.messages, updatedMessage];
            const updatedSession: ChatSession = {
                ...prevSession,
                messages: updatedMessages,
                lastMessage: message.timestamp,
                title:
                    updatedMessages.length === 2
                        ? bnsStorageUtils.generateSessionTitle(updatedMessages)
                        : prevSession.title,
            };
            bnsStorageUtils.saveSession(updatedSession);
            setChatSessions(bnsStorageUtils.getAllSessions());
            return updatedSession;
        });
    };

    const handleTextSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!textInput.trim() && !attachedAudio) || !currentSession) return;

        // Store current input values
        const currentText = textInput.trim();
        const currentAudio = attachedAudio;

        // Clear inputs immediately
        setTextInput('');
        setAttachedAudio(null);

        // Send the message and wait for it to be added before processing
        if (currentAudio && currentText) {
            await sendCombinedMessage(currentText, currentAudio);
        } else if (currentAudio) {
            await sendAudioMessage(currentAudio);
        } else {
            await sendTextMessage(currentText);
        }
    };

    const sendTextMessage = async (text: string) => {
        if (!currentSession) return;

        const userMessage: Message = {
            id: Date.now(),
            sender: 'user',
            type: 'text',
            content: text,
            timestamp: new Date(),
            bns_sections: undefined,
            isBotAudio: undefined
        };

        addMessage(userMessage);
        setTyping(true);

        // Create bot response with an ID that comes after the user message
        const botResponse: Message = {
            id: userMessage.id + 1, // Ensure it comes right after user message
            sender: 'bot',
            type: 'text',
            content: `I understand you're asking about "${text}". Let me help you with that.`,
            timestamp: new Date(),
            bns_sections: undefined,
            isBotAudio: undefined
        };

        setTimeout(() => {
            addMessage(botResponse);
            setTyping(false);
        }, 1500);
    };

    const sendAudioMessage = async (audio: AttachedAudio) => {
        if (!currentSession) return;

        const userMessage: Message = {
            id: Date.now(),
            sender: 'user',
            type: 'audio',
            content: audio.url || '', // Use the blob URL for playback
            timestamp: new Date(),
            bns_sections: undefined,
            isBotAudio: undefined
        };

        addMessage(userMessage);
        await processAudioWithBackend(audio.file);
    };

    const sendCombinedMessage = async (text: string, audio: AttachedAudio) => {
        if (!currentSession) return;

        const userMessage: Message = {
            id: Date.now(),
            sender: 'user',
            type: 'combined',
            content: text,
            audioUrl: audio.url,
            timestamp: new Date(),
            bns_sections: undefined,
            isBotAudio: undefined
        };

        addMessage(userMessage);
        await processAudioWithBackend(audio.file, text);
    };

    const processAudioWithBackend = async (audioFile: Blob, additionalText?: string) => {
        setTyping(true);
        try {
            console.log('Processing audio with backend...');
            console.log('Current session messages before processing:', currentSession?.messages.length);

            const formData = new FormData();
            const audioFileObj = new File([audioFile], 'audio_message.mp3', {
                type: 'audio/mpeg'
            });
            formData.append('audio', audioFileObj);

            if (additionalText) {
                const textData = additionalText.split('\n').reduce((acc, line) => {
                    const [key, value] = line.split(':').map(s => s.trim());
                    if (key && value) acc[key.toLowerCase()] = value;
                    return acc;
                }, {} as Record<string, string>);
                Object.entries(textData).forEach(([key, value]) => {
                    formData.append(key, value);
                });
            }

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/bns-chat', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server responded with ${response.status}`);
            }

            const data = await response.json();
            console.log('Backend response received:', data);

            // Use backend URL directly instead of creating blob URL
            const backendAudioUrl = data.audio_url ? `http://localhost:5000${data.audio_url}` : null;
            console.log('Backend audio URL:', backendAudioUrl);

            // Get the last user message ID to ensure proper sequencing
            const lastUserMessageId = currentSession?.messages[currentSession.messages.length - 1]?.id || Date.now();

            const botResponse: Message = {
                id: lastUserMessageId + 1, // Ensure it comes right after user message
                sender: 'bot',
                type: 'audio-response',
                content: backendAudioUrl || '', // Use backend URL or empty string
                timestamp: new Date(),
                matchedSections: data.matched_sections || [],
                translatedTexts: data.translated_texts || [],
                ipcSections: data.ipc_sections || [],
                language: data.language || '',
                pdfEnglishUrl: data.pdf_english_url || '',
                pdfRegionalUrl: data.pdf_regional_url || '',
                transcribedText: data.transcribed_text || '',
                formattedOutput: data.formatted_output || '',
                bns_sections: data.bns_sections || [] // Add bns_sections to the message
                ,
                isBotAudio: undefined
            };

            console.log('Adding bot response to session...');
            addMessage(botResponse);
            console.log('Bot response added. Session messages after:', currentSession?.messages.length);
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage: Message = {
                id: Date.now() + 1,
                sender: 'bot',
                type: 'text',
                content: `Error: ${error instanceof Error ? error.message : 'Failed to process audio'}`,
                timestamp: new Date(),
                bns_sections: undefined,
                isBotAudio: undefined
            };
            addMessage(errorMessage);
        } finally {
            setTyping(false);
        }
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
            attachAudioToInput(audioBlob, 'Recorded Audio');
        };
    };

    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            attachAudioToInput(file, file.name);
        }
        // Clear the input so the same file can be selected again
        e.target.value = '';
    };

    const attachAudioToInput = async (audioFile: Blob, fileName: string) => {
        // Create a blob URL for the user's audio file so it can be played
        const blobUrl = URL.createObjectURL(audioFile);
        const base64 = await blobToBase64(audioFile);
        setAttachedAudio({
            file: audioFile,
            url: blobUrl,
            name: fileName,
            base64,
        });
    };

    const removeAttachedAudio = () => {
        // Clean up the blob URL to prevent memory leaks
        if (attachedAudio?.url) {
            URL.revokeObjectURL(attachedAudio.url);
        }
        setAttachedAudio(null);
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
                return (
                    <div>
                        {msg.content && msg.content.trim() !== '' && (
                            <AudioPlayer audioUrl={msg.content} />
                        )}
                    </div>
                );

            case 'combined':
                return (
                    <div className="space-y-3">
                        <div className="prose prose-sm max-w-none">
                            <p className="mb-0 whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.audioUrl && msg.audioUrl.trim() !== '' && (
                            <div className="border-t border-blue-200 pt-3">
                                <AudioPlayer audioUrl={msg.audioUrl} />
                            </div>
                        )}
                    </div>
                );

            case 'audio-response':
                return (
                    <div className="space-y-4">
                        {msg.content && msg.content.trim() !== '' && (
                            <AudioPlayer audioUrl={msg.content} />
                        )}

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

                        {msg.transcribedText && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700">
                                <h3 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Transcribed Text:</h3>
                                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{msg.transcribedText}</p>
                            </div>
                        )}

                        {msg.ipcSections && msg.ipcSections.length > 0 && (
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-300 dark:border-purple-700 mt-4">
                                <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">Matched IPC Sections:</h3>
                                <div className="space-y-4">
                                    {msg.ipcSections.map((section, index) => (
                                        <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-600">
                                            <p className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                                                IPC Section {section["IPC Section"]}: {section["Name"]}
                                            </p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Category:</strong> {section["Category"]}</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Description:</strong> {section["Description"]}</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Punishment:</strong> {section["Punishment"]}</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Cognizable/Non-Cognizable:</strong> {section["Cognizable/Non-Cognizable"]}</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Bailable/Non-Bailable:</strong> {section["Bailable/Non-Bailable"]}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Matched BNS Sections block */}
                        {msg.bns_sections && msg.bns_sections.length > 0 && (
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-300 dark:border-purple-700 mt-4">
                                <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">Matched BNS Sections:</h3>
                                <div className="space-y-4">
                                    {msg.bns_sections.map((section: { [x: string]: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
                                        <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-600">
                                            <p className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                                                BNS Section {section["bns Section"]}: {section["Name"] || section["Description"]}
                                            </p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Category:</strong> {section["Category"]}</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Description:</strong> {section["Description"]}</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Punishment:</strong> {section["Punishment"]}</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Cognizable/Non-Cognizable:</strong> {section["Cognizable/Non-Cognizable"]}</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Bailable/Non-Bailable:</strong> {section["Bailable/Non-Bailable"]}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(msg.pdfEnglishUrl || msg.pdfRegionalUrl) && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-300 dark:border-green-700 mt-4">
                                <h3 className="font-semibold text-green-700 dark:text-green-300 mb-3">Download Reports:</h3>
                                <div className="flex flex-col space-y-2">
                                    {msg.pdfEnglishUrl && (
                                        <a href={`http://localhost:5000${msg.pdfEnglishUrl}`} target="_blank" rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 underline">
                                            📄 English PDF
                                        </a>
                                    )}
                                    {msg.pdfRegionalUrl && (
                                        <a href={`http://localhost:5000${msg.pdfRegionalUrl}`} target="_blank" rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 underline">
                                            📄 Regional Language PDF
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    // Add handlers for reload, edit, save edit, cancel edit
    const handleReloadMessage = (msg: Message) => {
        if (msg.type === 'text') {
            sendTextMessage(msg.content);
        } else if (msg.type === 'audio' && msg.audioBase64) {
            const blob = base64ToBlob(msg.audioBase64);
            sendAudioMessage({ file: blob, url: msg.audioUrl || '', name: 'Reloaded Audio' });
        } else if (msg.type === 'combined' && msg.audioBase64) {
            const blob = base64ToBlob(msg.audioBase64);
            sendCombinedMessage(msg.content, { file: blob, url: msg.audioUrl || '', name: 'Reloaded Audio' });
        }
    };

    const handleEditMessage = (msg: Message) => {
        setEditingMessageId(msg.id);
        setEditText(msg.content);
        if (msg.audioBase64) {
            const blob = base64ToBlob(msg.audioBase64);
            setEditAudio({ file: blob, url: msg.audioUrl || URL.createObjectURL(blob), name: 'Edit Audio', base64: msg.audioBase64 });
        } else {
            setEditAudio(null);
        }
    };

    const handleSaveEdit = async (msg: Message) => {
        if (!currentSession) return;
        const newId = Date.now();
        const newMsg: Message = {
            ...msg,
            id: newId,
            content: editText,
            timestamp: new Date(),
        };
        if (editAudio) {
            newMsg.audioBase64 = editAudio.base64;
            newMsg.audioUrl = editAudio.url;
        } else {
            delete newMsg.audioBase64;
            delete newMsg.audioUrl;
        }
        // Remove old message
        const updatedMessages = currentSession.messages.filter((m: Message) => m.id !== msg.id);
        const updatedSession = { ...currentSession, messages: updatedMessages };
        bnsStorageUtils.saveSession(updatedSession);
        setCurrentSession(updatedSession);
        // Resend
        if (msg.type === 'text') {
            await sendTextMessage(editText);
        } else if (msg.type === 'audio' && editAudio) {
            await sendAudioMessage(editAudio);
        } else if (msg.type === 'combined' && editAudio) {
            await sendCombinedMessage(editText, editAudio);
        }
        setEditingMessageId(null);
        setEditText('');
        setEditAudio(null);
    };

    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setEditText('');
        setEditAudio(null);
    };

    const defaultUserTemplate = `name:\ngender:\nage:\nlocation:\nphone:\nid_number:\nemail:`;

    const handleFillDefaultFields = () => {
        if (textInput.trim() !== '') {
            if (!window.confirm('This will overwrite your current input. Continue?')) return;
        }
        setTextInput(defaultUserTemplate);
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
        <div className="h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Sidebar */}
            <ChatSidebar
                sidebarOpen={sidebarOpen}
                darkMode={darkMode}
                chatSessions={chatSessions}
                currentSessionId={currentSession.id}
                onNewChat={createNewChat}
                onSelectSession={selectSession}
                onDeleteSession={deleteSession}
                onRenameSession={renameSession}
                onToggleDarkMode={toggleDarkMode}
                formatTime={formatTime}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 h-screen transition-colors duration-300">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 flex-shrink-0 relative">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {sidebarOpen ? <X className="h-5 w-5 text-gray-600 dark:text-gray-300" /> : <Sidebar className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                            Voice For The Weak
                        </h1>
                    </div>
                    <div className="flex items-center space-x-2 relative">
                        {/* Dark/Light Mode Toggle */}
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <LayoutDashboard className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">Dashboard</span>
                        </button>
                        {/* User Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen((v) => !v)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none"
                            >
                                <User className="h-5 w-5 text-white" />
                                <span className="text-white text-sm font-medium">{username}</span>
                                <ChevronDown className="h-4 w-4 text-white" />
                            </button>
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                                    <div className="px-4 py-2 text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700">{username}</div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-4xl mx-auto p-4 space-y-6">
                        {currentSession.messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-600 ml-3' : 'bg-gray-600 dark:bg-gray-500 mr-3'}`}>
                                        {msg.sender === 'user' ?
                                            <User className="h-5 w-5 text-white" /> :
                                            <Bot className="h-5 w-5 text-white" />
                                        }
                                    </div>

                                    <div className={`group relative ${msg.sender === 'user' ? 'mr-3' : 'ml-3'}`}>
                                        {editingMessageId === msg.id && currentSession && (
                                            <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
                                                <textarea
                                                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                                                    value={editText}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditText(e.target.value)}
                                                    rows={2}
                                                />
                                                {editAudio && (
                                                    <AudioPlayer audioUrl={editAudio.url} />
                                                )}
                                                <div className="flex space-x-2 mt-2">
                                                    <button
                                                        onClick={() => handleSaveEdit(currentSession.messages.find((m: Message) => m.id === editingMessageId)!)}
                                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                    >Save</button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-700"
                                                    >Cancel</button>
                                                </div>
                                            </div>
                                        )}
                                        <div className={`${msg.type === 'text' ? 'p-4 rounded-2xl' : 'p-3 rounded-xl'} ${msg.sender === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'}`}>
                                            {renderMessage(msg)}
                                        </div>

                                        <div className="flex flex-col space-y-1 mt-2">
                                            <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(msg.timestamp)}</span>
                                                </div>
                                                {msg.type === 'text' && (
                                                    <button
                                                        onClick={() => copyMessage(msg.content)}
                                                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                    >
                                                        <Copy className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                                    </button>
                                                )}
                                            </div>
                                            {/* User message controls */}
                                            {msg.sender === 'user' && (
                                                <div className="flex space-x-2 mt-1">
                                                    <button
                                                        onClick={() => handleReloadMessage(msg)}
                                                        className="p-1 rounded"
                                                        title="Resend"
                                                    >
                                                        <RefreshCw className="h-4 w-4 text-white" />
                                                    </button>
                                                    <button
                                                        onClick={() => copyMessage(msg.content)}
                                                        className="p-1 rounded"
                                                        title="Copy"
                                                    >
                                                        <Copy className="h-4 w-4 text-white" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditMessage(msg)}
                                                        className="p-1 rounded"
                                                        title="Edit"
                                                    >
                                                        <Edit3 className="h-4 w-4 text-white" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {typing && (
                            <div className="flex justify-start items-center space-x-2">
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-600 dark:bg-gray-500 flex items-center justify-center flex-shrink-0">
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl shadow-sm">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setTyping(false); setCancelBot(true); }}
                                    className="ml-2 p-2 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700"
                                    title="Cancel bot response"
                                >
                                    <Cross className="h-5 w-5 text-red-600 dark:text-red-300" />
                                </button>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                    <div className="max-w-4xl mx-auto">
                        {/* Attached Audio Preview */}
                        {attachedAudio && (
                            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                                            <Volume2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                                {attachedAudio.name}
                                            </p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                Audio file attached
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={removeAttachedAudio}
                                        className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mb-2 flex justify-end">
                            <button
                                type="button"
                                onClick={handleFillDefaultFields}
                                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                            >
                                Fill User Details Template
                            </button>
                        </div>

                        <form onSubmit={handleTextSubmit} className="flex items-center space-x-3">
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
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[48px] max-h-32 placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder={
                                        attachedAudio
                                            ? "Add context text (name, email, etc.) for your audio..."
                                            : "Type your message or upload audio..."
                                    }
                                    rows={1}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!textInput.trim() && !attachedAudio}
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

export default BSNSections;