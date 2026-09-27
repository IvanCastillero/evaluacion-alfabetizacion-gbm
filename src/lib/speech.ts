/**
 * Servicio de síntesis de voz con Web Speech API.
 * Selecciona la primera voz en español disponible y proporciona fallback
 * visual si no hay voces o la síntesis no está disponible.
 */

type SpeechListener = (speaking: boolean, text: string) => void;

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private listeners: Set<SpeechListener> = new Set();
  private isCurrentlySpeaking: boolean = false;
  private fallbackTimeout: number | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Buscar la primera voz en español (es-PA, es-MX, es-419, es-ES, etc.)
    const esVoice = voices.find((v) => v.lang.toLowerCase().startsWith('es'));
    if (esVoice) {
      this.voice = esVoice;
    }
  }

  public subscribe(listener: SpeechListener): () => void {
    this.listeners.add(listener);
    listener(this.isCurrentlySpeaking, '');
    return () => this.listeners.delete(listener);
  }

  private notify(speaking: boolean, text: string = '') {
    this.isCurrentlySpeaking = speaking;
    this.listeners.forEach((cb) => cb(speaking, text));
  }

  public speak(text: string) {
    this.stop();

    if (!text || !text.trim()) return;

    if (this.synth && 'SpeechSynthesisUtterance' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        if (!this.voice) {
          this.initVoices();
        }
        if (this.voice) {
          utterance.voice = this.voice;
        }
        utterance.lang = 'es-PA';
        utterance.rate = 0.95; // Ligeramente más pausado para máxima claridad
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          this.notify(true, text);
        };

        utterance.onend = () => {
          this.notify(false, '');
        };

        utterance.onerror = () => {
          this.notify(false, '');
        };

        this.synth.speak(utterance);
        return;
      } catch {
        // Fallback visual si falla la síntesis
      }
    }

    // Fallback visual (resaltado durante unos segundos) si no hay síntesis
    this.notify(true, text);
    const durationMs = Math.max(2000, text.split(' ').length * 350);
    this.fallbackTimeout = window.setTimeout(() => {
      this.notify(false, '');
      this.fallbackTimeout = null;
    }, durationMs);
  }

  public stop() {
    if (this.fallbackTimeout) {
      clearTimeout(this.fallbackTimeout);
      this.fallbackTimeout = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }
    if (this.isCurrentlySpeaking) {
      this.notify(false, '');
    }
  }

  public isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }
}

export const speechService = new SpeechService();
