/**
 * Procedural Web Audio Pop Music + Cartoon SFX + iPad-Reliable Voice Helper.
 * Automatically ducks pop music while speaking hints so a 5-year-old hears every word clearly.
 */

const NOTE_FREQ: Record<string, number> = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  C6: 1046.5,
};

const MELODY_STEPS: (string | null)[] = [
  'E5', null, 'G5', null, 'A5', 'G5', 'E5', null,
  'D5', null, 'G5', null, 'B4', null, 'D5', null,
  'C5', null, 'E5', null, 'G5', 'E5', 'C5', null,
  'A4', 'C5', 'F5', null, 'E5', 'D5', 'C5', null,
];

const BASS_STEPS: (string | null)[] = [
  'C3', null, null, 'C3', null, null, 'G3', null,
  'G3', null, null, 'G3', null, null, 'D3', null,
  'A3', null, null, 'A3', null, null, 'E3', null,
  'F3', null, null, 'F3', 'G3', null, 'G3', null,
];

const CHORD_STEPS: (string[] | null)[] = [
  ['C4', 'E4', 'G4'], null, null, null, ['C4', 'E4', 'G4'], null, null, null,
  ['G3', 'B3', 'D4'], null, null, null, ['G3', 'B3', 'D4'], null, null, null,
  ['A3', 'C4', 'E4'], null, null, null, ['A3', 'C4', 'E4'], null, null, null,
  ['F3', 'A3', 'C4'], null, null, null, ['G3', 'B3', 'D4'], null, null, null,
];

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicTimer: number | null = null;
  private step = 0;
  private musicEnabled = true;
  private voiceEnabled = true;
  private partyBoost = false;
  private musicDucked = false;
  private duckResetTimer: number | null = null;
  private speechPrimed = false;
  private cachedVoice: SpeechSynthesisVoice | null = null;
  // Keep reference alive so Safari never garbage-collects onend handlers mid-speech.
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const refreshVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        this.cachedVoice =
          voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              /samantha|karen|google us english|zira|moira|tessa/i.test(v.name)
          ) ??
          voices.find((v) => v.lang.startsWith('en-US')) ??
          voices.find((v) => v.lang.startsWith('en')) ??
          null;
      };
      refreshVoice();
      window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoice);
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public unlock(): void {
    const ctx = this.getContext();
    if (ctx && this.musicEnabled && this.musicTimer === null) {
      this.startMusicLoop();
    }
    // Synchronously prime iOS Safari speechSynthesis inside the first tap gesture.
    if (!this.speechPrimed && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechPrimed = true;
      try {
        const primer = new SpeechSynthesisUtterance('');
        primer.volume = 0;
        window.speechSynthesis.speak(primer);
      } catch {
        // Ignore if unavailable.
      }
    }
  }

  public setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (enabled) {
      this.unlock();
      this.startMusicLoop();
    } else {
      this.stopMusicLoop();
    }
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.voiceEnabled = enabled;
    if (!enabled) {
      this.stopSpeech();
    }
  }

  public setPartyBoost(active: boolean): void {
    this.partyBoost = active;
  }

  private setMusicDucked(ducked: boolean, maxMs = 4500): void {
    if (this.duckResetTimer !== null) {
      window.clearTimeout(this.duckResetTimer);
      this.duckResetTimer = null;
    }
    this.musicDucked = ducked;
    if (ducked) {
      this.duckResetTimer = window.setTimeout(() => {
        this.musicDucked = false;
        this.duckResetTimer = null;
      }, maxMs);
    }
  }

  private startMusicLoop(): void {
    if (this.musicTimer !== null || !this.musicEnabled) return;
    const stepMs = 127; // ~118 BPM 16th-note pulse
    this.musicTimer = window.setInterval(() => {
      if (!this.musicEnabled) return;
      const ctx = this.ctx;
      if (!ctx || ctx.state !== 'running') return;
      this.playMusicStep(ctx, this.step);
      this.step = (this.step + 1) % MELODY_STEPS.length;
    }, stepMs);
  }

  private stopMusicLoop(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private playTone(
    ctx: AudioContext,
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    startOffset = 0,
    slideToFreq?: number
  ): void {
    const now = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(40, slideToFreq),
        now + duration
      );
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playKick(ctx: AudioContext, volume = 0.12): void {
    this.playTone(ctx, 140, 0.11, 'sine', volume, 0, 45);
  }

  private playClap(ctx: AudioContext, volume = 0.045): void {
    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.06);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  private playMusicStep(ctx: AudioContext, step: number): void {
    const duckFactor = this.musicDucked ? 0.2 : 1;
    const volScale = (this.partyBoost ? 1.25 : 0.9) * duckFactor;

    if (step % 4 === 0) {
      this.playKick(ctx, 0.11 * volScale);
    }
    if (step % 8 === 4) {
      this.playClap(ctx, 0.04 * volScale);
    }

    const bass = BASS_STEPS[step];
    if (bass && NOTE_FREQ[bass]) {
      this.playTone(ctx, NOTE_FREQ[bass], 0.22, 'triangle', 0.075 * volScale);
    }

    const chord = CHORD_STEPS[step];
    if (chord) {
      for (const note of chord) {
        if (NOTE_FREQ[note]) {
          this.playTone(ctx, NOTE_FREQ[note], 0.28, 'sine', 0.028 * volScale);
        }
      }
    }

    const melody = MELODY_STEPS[step];
    if (melody && NOTE_FREQ[melody]) {
      this.playTone(ctx, NOTE_FREQ[melody], 0.19, 'triangle', 0.055 * volScale);
      if (this.partyBoost && !this.musicDucked) {
        this.playTone(ctx, NOTE_FREQ[melody] * 2, 0.12, 'sine', 0.025);
      }
    }
  }

  public playTap(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.playTone(ctx, 560, 0.07, 'sine', 0.14, 0, 720);
  }

  public playCount(countIndex: number): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
    const freq = scale[countIndex % scale.length];
    this.playTone(ctx, freq, 0.14, 'triangle', 0.15);
  }

  public playCorrect(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      this.playTone(ctx, freq, 0.24, 'triangle', 0.16, i * 0.07);
      this.playTone(ctx, freq * 2, 0.16, 'sine', 0.06, i * 0.07 + 0.02);
    });
  }

  public playWrong(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.playTone(ctx, 320, 0.16, 'sine', 0.13, 0, 240);
    this.playTone(ctx, 250, 0.2, 'sine', 0.1, 0.12, 290);
  }

  public playChickenBawk(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.playTone(ctx, 640, 0.08, 'sawtooth', 0.09, 0, 980);
    this.playTone(ctx, 880, 0.1, 'sawtooth', 0.08, 0.09, 480);
  }

  public playRaccoonChase(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    [0, 0.18, 0.36, 0.62, 0.8].forEach((offset, idx) => {
      const base = idx % 2 === 0 ? 700 : 820;
      this.playTone(ctx, base, 0.09, 'sawtooth', 0.085, offset, base + 340);
      this.playTone(ctx, base + 220, 0.08, 'triangle', 0.07, offset + 0.06, 440);
    });
    this.playTone(ctx, 260, 0.14, 'triangle', 0.16, 0.48, 520);
    this.playTone(ctx, 420, 0.42, 'sine', 0.12, 1.05, 1480);
  }

  /** Silly cartoon wah-wah-boing for Mikey's wrong-answer prank! */
  public playPrankFakeout(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.playTone(ctx, 460, 0.18, 'triangle', 0.16, 0, 415);
    this.playTone(ctx, 415, 0.18, 'triangle', 0.16, 0.2, 370);
    this.playTone(ctx, 370, 0.32, 'sawtooth', 0.08, 0.4, 240);
  }

  /** Cheeky seesaw boing-giggle for the "6 7" meme easter egg! */
  public playSixSevenGiggle(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.playTone(ctx, 440, 0.12, 'triangle', 0.15, 0, 587.33);
    this.playTone(ctx, 587.33, 0.14, 'triangle', 0.15, 0.13, 493.88);
    this.playTone(ctx, 659.25, 0.08, 'sine', 0.11, 0.28, 783.99);
    this.playTone(ctx, 783.99, 0.09, 'sine', 0.11, 0.37, 880);
  }

  /** Fun dramatic synth rumble when cartoon Gwi-Ma appears on stage! */
  public playGwimaArrival(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.playTone(ctx, 180, 0.35, 'sawtooth', 0.09, 0, 110);
    this.playTone(ctx, 260, 0.28, 'triangle', 0.1, 0.12, 165);
  }

  /** Sparkling rainbow star-laser blast defeating Gwi-Ma! */
  public playGwimaBlast(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    // Star-beam laser zaps
    [0, 0.14, 0.28].forEach((t) => {
      this.playTone(ctx, 1320, 0.16, 'sawtooth', 0.075, t, 480);
      this.playTone(ctx, 880, 0.18, 'triangle', 0.1, t + 0.04, 1560);
    });
    // Pop-star sparkle victory chord + Gwi-Ma dizzy shrink whistle
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this.playTone(ctx, f, 0.35, 'triangle', 0.12, 0.48 + i * 0.04);
    });
    this.playTone(ctx, 920, 0.45, 'sine', 0.11, 0.78, 220);
  }

  /** Playful boing-bonk + bamboo marimba rain for Panda Pals gag! */
  public playBambooRain(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    // Red Panda "RAWR!" bounce
    this.playTone(ctx, 280, 0.18, 'triangle', 0.15, 0, 540);
    // Bamboo shoot tumble marimba clatter
    const clatter = [784, 659, 880, 587, 988, 698, 1046];
    clatter.forEach((freq, i) => {
      this.playTone(ctx, freq, 0.1, 'triangle', 0.11, 0.22 + i * 0.075);
    });
    // Giant Panda happy chomp
    this.playTone(ctx, 320, 0.1, 'sine', 0.14, 0.82, 220);
    this.playTone(ctx, 360, 0.1, 'sine', 0.14, 0.98, 240);
  }

  public playWinFanfare(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const fanfare = [
      { f: 523.25, t: 0, d: 0.16 },
      { f: 659.25, t: 0.12, d: 0.16 },
      { f: 783.99, t: 0.24, d: 0.16 },
      { f: 1046.5, t: 0.36, d: 0.26 },
      { f: 880.0, t: 0.56, d: 0.16 },
      { f: 1046.5, t: 0.72, d: 0.5 },
    ];
    for (const n of fanfare) {
      this.playTone(ctx, n.f, n.d, 'triangle', 0.17, n.t);
      this.playTone(ctx, n.f * 1.5, n.d * 0.8, 'sine', 0.06, n.t);
    }
  }

  public stopSpeech(): void {
    this.setMusicDucked(false);
    this.activeUtterance = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore.
      }
    }
  }

  public speak(text: string, options?: SpeakOptions): void {
    if (!this.voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      options?.onEnd?.();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = options?.rate ?? 0.96;
      utterance.pitch = options?.pitch ?? 1.15;
      utterance.volume = 1.0;
      if (this.cachedVoice) {
        utterance.voice = this.cachedVoice;
      }

      this.activeUtterance = utterance;
      const estimatedMs = Math.max(1800, text.length * 85);
      this.setMusicDucked(true, estimatedMs + 800);

      utterance.onend = () => {
        if (this.activeUtterance === utterance) {
          this.activeUtterance = null;
          this.setMusicDucked(false);
        }
        options?.onEnd?.();
      };
      utterance.onerror = () => {
        if (this.activeUtterance === utterance) {
          this.activeUtterance = null;
          this.setMusicDucked(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.setMusicDucked(false);
      options?.onEnd?.();
    }
  }
}

export const soundEngine = new SoundEngine();
