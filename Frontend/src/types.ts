export type Message = {
    id: number;
    sender: 'user' | 'bot';
    type: 'text' | 'audio' | 'combined' | 'audio-response';
    content: string;
    audioUrl?: string;
    timestamp: Date;
    matchedSections?: string[];
    translatedTexts?: string[];
    ipcSections?: Array<{
        "Bailable/Non-Bailable": string;
        "Category": string;
        "Cognizable/Non-Cognizable": string;
        "Description": string;
        "IPC Section": string;
        "Name": string;
        "Punishment": string;
    }>;
    language?: string;
    pdfEnglishUrl?: string;
    pdfRegionalUrl?: string;
    transcribedText?: string;
    formattedOutput?: string;
    audioFile?: Blob;
    audioBase64?: string; // base64 string for persistent audio
};


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