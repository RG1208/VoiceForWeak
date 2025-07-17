/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatSession, Message } from '../types';

const BNS_STORAGE_KEY = 'bns_chat_sessions';
const BNS_CURRENT_SESSION_KEY = 'bns_current_session_id';

export const bnsStorageUtils = {
    getAllSessions(): ChatSession[] {
        try {
            const stored = localStorage.getItem(BNS_STORAGE_KEY);
            if (!stored) return [];
            const sessions = JSON.parse(stored);
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
            console.error('Error loading BNS sessions:', error);
            return [];
        }
    },
    saveSessions(sessions: ChatSession[]): void {
        try {
            localStorage.setItem(BNS_STORAGE_KEY, JSON.stringify(sessions));
        } catch (error) {
            console.error('Error saving BNS sessions:', error);
        }
    },
    getSession(sessionId: string): ChatSession | null {
        const sessions = this.getAllSessions();
        return sessions.find(session => session.id === sessionId) || null;
    },
    saveSession(session: ChatSession): void {
        const sessions = this.getAllSessions();
        const existingIndex = sessions.findIndex(s => s.id === session.id);
        if (existingIndex >= 0) {
            sessions[existingIndex] = session;
        } else {
            sessions.unshift(session);
        }
        if (sessions.length > 50) {
            sessions.splice(50);
        }
        this.saveSessions(sessions);
    },
    deleteSession(sessionId: string): void {
        const sessions = this.getAllSessions();
        const filteredSessions = sessions.filter(s => s.id !== sessionId);
        this.saveSessions(filteredSessions);
    },
    getCurrentSessionId(): string | null {
        return localStorage.getItem(BNS_CURRENT_SESSION_KEY);
    },
    setCurrentSessionId(sessionId: string): void {
        localStorage.setItem(BNS_CURRENT_SESSION_KEY, sessionId);
    },
    generateSessionTitle(messages: Message[]): string {
        const firstUserMessage = messages.find(msg => msg.sender === 'user' && msg.type === 'text');
        if (firstUserMessage) {
            const content = firstUserMessage.content.trim();
            if (content.length > 30) {
                return content.substring(0, 30) + '...';
            }
            return content;
        }
        return 'New BNS Chat';
    },
    createNewSession(): ChatSession {
        const sessionId = `bns_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date();
        return {
            id: sessionId,
            title: 'New BNS Chat',
            lastMessage: now,
            createdAt: now,
            messages: [{
                id: 1,
                sender: 'bot',
                type: 'text',
                content: 'Hello! I\'m your BNS Legal AI assistant. How can I help you today?',
                timestamp: now
            }]
        };
    }
}; 