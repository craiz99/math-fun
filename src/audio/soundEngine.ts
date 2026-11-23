/**
 * Procedural Web Audio Pop Music + Cartoon SFX + Voice Helper.
 * Zero external audio assets needed; safely unlocks on first iPad Safari tap.
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

// Catchy 32-step (2-bar x 2) bubblegum K-pop synth groove at ~118 BPM (16th notes)
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

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicTimer: number | null = null;
  private step = 0;
  private musicEnabled = true;
  private voiceEnabled = true;
  private partyBoost = false;

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
    if (!ctx) return;
    if (this.musicEnabled && this.musicTimer === null) {
      this.startMusicLoop();
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
    if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public setPartyBoost(active: boolean): void {
    this.partyBoost = active;
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
    const volScale = this.partyBoost ? 1.25 : 0.9;

    // Pop four-on-the-floor kick & bouncy backbeat clap
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
      if (this.partyBoost) {
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
    // Soft, friendly cartoon boing — never a harsh buzzer!
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
    // Rapid fierce chicken battle squawks + cartoon bonk + raccoon flee whistle!
    [0, 0.18, 0.36, 0.62, 0.8].forEach((offset, idx) => {
      const base = idx % 2 === 0 ? 700 : 820;
      this.playTone(ctx, base, 0.09, 'sawtooth', 0.085, offset, base + 340);
      this.playTone(ctx, base + 220, 0.08, 'triangle', 0.07, offset + 0.06, 440);
    });
    // Comedic cartoon "BONK!"
    this.playTone(ctx, 260, 0.14, 'triangle', 0.16, 0.48, 520);
    // Classic fleeing slide-whistle zip off screen!
    this.playTone(ctx, 420, 0.42, 'sine', 0.12, 1.05, 1480);
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public speak(text: string): void {
    if (!this.voiceEnabled || typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.02;
      utterance.pitch = 1.18;
      utterance.volume = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const friendlyVoice = voices.find(
        (v) => v.lang.startsWith('en') && /samantha|google us|karen|zira/i.test(v.name)
      );
      if (friendlyVoice) utterance.voice = friendlyVoice;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis is optional enhancement.
    }
  }
}

export const soundEngine = new SoundEngine();
