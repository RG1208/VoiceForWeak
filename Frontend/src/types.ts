export interface Message {
    id: number;
    sender: 'user' | 'bot';
    type: 'text' | 'audio' | 'audio-response';
    content: string;
    timestamp: Date;
    // Additional fields for audio responses
    matchedSections?: string[];
    translatedTexts?: string[];
}

export interface ChatSession {
    id: string;
    title: string;
    lastMessage: Date;
    messages: Message[];
    createdAt: Date;
}

export interface AudioPlayerProps {
    audioUrl: string;
    onTimeUpdate?: (currentTime: number) => void;
}