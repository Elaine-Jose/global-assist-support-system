/**
 * Voice Assistant Service
 * Handles Speech-to-Text (Recognition) and Text-to-Speech (Synthesis)
 * using the Web Speech API.
 */

export interface VoiceAssistantOptions {
    onResult: (text: string) => void;
    onError: (error: string) => void;
    onEnd: () => void;
    language?: string;
}

export class VoiceAssistant {
    private recognition: any = null;
    private synth: SpeechSynthesis | null = null;
    private isRecording: boolean = false;

    constructor() {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = false;
                this.recognition.interimResults = false;
            }
            this.synth = window.speechSynthesis;
        }
    }

    /**
     * Start recording voice and convert to text.
     */
    startListening(options: VoiceAssistantOptions) {
        if (!this.recognition) {
            options.onError("Speech recognition not supported in this browser.");
            return;
        }

        if (this.isRecording) return;

        this.recognition.lang = options.language || 'en-US';

        this.recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            options.onResult(text);
        };

        this.recognition.onerror = (event: any) => {
            options.onError(event.error);
            this.isRecording = false;
        };

        this.recognition.onend = () => {
            this.isRecording = false;
            options.onEnd();
        };

        try {
            this.recognition.start();
            this.isRecording = true;
        } catch (err) {
            options.onError("Failed to start recognition.");
            this.isRecording = false;
        }
    }

    /**
     * Stop recording.
     */
    stopListening() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
            this.isRecording = false;
        }
    }

    /**
     * Convert text to speech.
     */
    speak(text: string, language: string = 'en-US') {
        if (!this.synth) return;

        // Cancel any ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;

        // Try to find a good voice for the language
        const voices = this.synth.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith(language));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        this.synth.speak(utterance);
    }

    /**
     * Cancel any ongoing speech.
     */
    stopSpeaking() {
        if (this.synth) {
            this.synth.cancel();
        }
    }
}

// Singleton instance
export const voiceAssistant = new VoiceAssistant();
