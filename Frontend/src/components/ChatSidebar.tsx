import React, { useState } from 'react';
import {
    Plus, MessageSquare, MoreHorizontal, Moon, Sun, Settings, Trash2, Edit2
} from 'lucide-react';
import { ChatSession } from '../types';

interface ChatSidebarProps {
    sidebarOpen: boolean;
    darkMode: boolean;
    chatSessions: ChatSession[];
    currentSessionId: string | null;
    onNewChat: () => void;
    onSelectSession: (sessionId: string) => void;
    onDeleteSession: (sessionId: string) => void;
    onRenameSession: (sessionId: string, newTitle: string) => void;
    onToggleDarkMode: () => void;
    formatTime: (date: Date) => string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
    sidebarOpen,
    darkMode,
    chatSessions,
    currentSessionId,
    onNewChat,
    onSelectSession,
    onDeleteSession,
    onRenameSession,
    onToggleDarkMode,
    formatTime
}) => {
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    const handleRenameClick = (e: React.MouseEvent, session: ChatSession) => {
        e.stopPropagation();
        setEditingSessionId(session.id);
        setEditTitle(session.title);
    };

    const handleRenameSave = (sessionId: string) => {
        if (editTitle.trim()) {
            onRenameSession(sessionId, editTitle.trim());
        }
        setEditingSessionId(null);
        setEditTitle('');
    };

    const handleRenameCancel = () => {
        setEditingSessionId(null);
        setEditTitle('');
    };

    const handleRenameKeyPress = (e: React.KeyboardEvent, sessionId: string) => {
        if (e.key === 'Enter') {
            handleRenameSave(sessionId);
        } else if (e.key === 'Escape') {
            handleRenameCancel();
        }
    };
    return (
        <div className={`${sidebarOpen ? 'w-64' : 'w-0'} h-screen transition-all duration-300 bg-gray-900 text-white flex flex-col overflow-hidden`}>
            {/* New Chat Button */}
            <div className="p-4 border-b border-gray-700 flex-shrink-0">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center space-x-2 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    <span>New Chat</span>
                </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-3 px-2">
                    Recent Chats
                </div>
                {chatSessions.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No chat history yet</p>
                    </div>
                ) : (
                    chatSessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => onSelectSession(session.id)}
                            className={`group flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-colors relative ${currentSessionId === session.id
                                    ? 'bg-gray-700 border border-gray-600'
                                    : 'hover:bg-gray-800'
                                }`}
                        >
                            <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                {editingSessionId === session.id ? (
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        onKeyDown={(e) => handleRenameKeyPress(e, session.id)}
                                        onBlur={() => handleRenameSave(session.id)}
                                        className="w-full bg-transparent text-sm font-medium border-none outline-none text-white"
                                        autoFocus
                                    />
                                ) : (
                                    <p 
                                        className="text-sm font-medium truncate cursor-pointer hover:text-blue-300"
                                        onClick={(e) => handleRenameClick(e, session)}
                                        title="Click to rename"
                                    >
                                        {session.title}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400">{formatTime(session.lastMessage)}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                                <button
                                    onClick={(e) => handleRenameClick(e, session)}
                                    className="p-1 rounded hover:bg-gray-600 transition-colors"
                                    title="Rename chat"
                                >
                                    <Edit2 className="h-3 w-3 text-gray-400 hover:text-blue-400" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Are you sure you want to delete this chat?')) {
                                            onDeleteSession(session.id);
                                        }
                                    }}
                                    className="p-1 rounded hover:bg-gray-600 transition-colors"
                                    title="Delete chat"
                                >
                                    <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-400" />
                                </button>
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Bottom Controls */}
            <div className="p-4 border-t border-gray-700 space-y-2 flex-shrink-0">
                <button
                    onClick={onToggleDarkMode}
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
    );
};

export default ChatSidebar;
