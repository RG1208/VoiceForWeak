/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatSession, Message } from '../types';

const STORAGE_KEY = 'chat_sessions';
const CURRENT_SESSION_KEY = 'current_session_id';

export const storageUtils = {
    // Get all chat sessions
    getAllSessions(): ChatSession[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return [];

            const sessions = JSON.parse(stored);
            // Convert timestamp strings back to Date objects
            return sessions.map((session: any) => ({
                ...session,
                lastMessage: new Date(session.lastMessage),
                createdAt: new Date(session.createdAt),
                messages: session.messages.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }))
            }));
        } catch (error) {
            console.error('Error loading sessions:', error);
            return [];
        }
    },

    // Save all sessions
    saveSessions(sessions: ChatSession[]): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        } catch (error) {
            console.error('Error saving sessions:', error);
        }
    },

    // Get a specific session by ID
    getSession(sessionId: string): ChatSession | null {
        const sessions = this.getAllSessions();
        return sessions.find(session => session.id === sessionId) || null;
    },

    // Save or update a session
    saveSession(session: ChatSession): void {
        const sessions = this.getAllSessions();
        const existingIndex = sessions.findIndex(s => s.id === session.id);

        if (existingIndex >= 0) {
            sessions[existingIndex] = session;
        } else {
            sessions.unshift(session); // Add new sessions to the beginning
        }

        // Keep only the last 50 sessions to prevent storage bloat
        if (sessions.length > 50) {
            sessions.splice(50);
        }

        this.saveSessions(sessions);
    },

    // Delete a session
    deleteSession(sessionId: string): void {
        const sessions = this.getAllSessions();
        const filteredSessions = sessions.filter(s => s.id !== sessionId);
        this.saveSessions(filteredSessions);
    },

    // Get current session ID
    getCurrentSessionId(): string | null {
        return localStorage.getItem(CURRENT_SESSION_KEY);
    },

    // Set current session ID
    setCurrentSessionId(sessionId: string): void {
        localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
    },

    // Generate a title from the first message
    generateSessionTitle(messages: Message[]): string {
        const firstUserMessage = messages.find(msg => msg.sender === 'user' && msg.type === 'text');
        if (firstUserMessage) {
            const content = firstUserMessage.content.trim();
            if (content.length > 30) {
                return content.substring(0, 30) + '...';
            }
            return content;
        }
        return 'New Chat';
    },

    // Create a new session
    createNewSession(): ChatSession {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date();

        return {
            id: sessionId,
            title: 'New Chat',
            lastMessage: now,
            createdAt: now,
            messages: [{
                id: 1,
                sender: 'bot',
                type: 'text',
                content: 'Hello! I\'m your Legal AI assistant. How can I help you today?',
                timestamp: now,
                bns_sections: undefined,
                isBotAudio: undefined
            }]
        };
    }
};