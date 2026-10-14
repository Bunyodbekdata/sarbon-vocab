/**
 * Web Speech API wrapper for English pronunciation
 */
class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(v => v.lang.startsWith('en'));
  }

  public speak(
    text: string,
    options?: {
      rate?: number;
      lang?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ): boolean {
    if (!this.isSupported || !this.synth) {
      return false;
    }

    try {
      this.synth.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate ?? 0.9;
      utterance.pitch = 1.0;

      // Select voice: preferred British or American
      const prefLang = options?.lang || 'en-GB';
      const selectedVoice =
        this.voices.find(v => v.lang === prefLang) ||
        this.voices.find(v => v.lang.startsWith(prefLang)) ||
        this.voices.find(v => v.lang.startsWith('en')) ||
        null;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = 'en-GB';
      }

      if (options?.onStart) utterance.onstart = options.onStart;
      if (options?.onEnd) utterance.onend = options.onEnd;
      if (options?.onError) utterance.onerror = options.onError;

      this.synth.speak(utterance);
      return true;
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      return false;
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public hasSupport(): boolean {
    return this.isSupported;
  }
}

export const speechService = new SpeechService();
