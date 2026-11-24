import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class MockOscillator {
  type: OscillatorType = 'sine';
  frequency = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class MockGain {
  gain = {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  connect = vi.fn();
}

class MockBufferSource {
  buffer: AudioBuffer | null = null;
  connect = vi.fn();
  start = vi.fn();
}

class MockBiquadFilter {
  type: BiquadFilterType = 'lowpass';
  frequency = { value: 0 };
  connect = vi.fn();
}

class MockAudioContext {
  state: AudioContextState = 'running';
  currentTime = 1.0;
  sampleRate = 44100;
  destination = {};
  oscillators: MockOscillator[] = [];
  gains: MockGain[] = [];
  bufferSources: MockBufferSource[] = [];
  resume = vi.fn(() => {
    this.state = 'running';
    return Promise.resolve();
  });
  createOscillator = vi.fn(() => {
    const osc = new MockOscillator();
    this.oscillators.push(osc);
    return osc as unknown as OscillatorNode;
  });
  createGain = vi.fn(() => {
    const gain = new MockGain();
    this.gains.push(gain);
    return gain as unknown as GainNode;
  });
  createBuffer = vi.fn((_channels: number, length: number) => {
    const data = new Float32Array(length);
    return {
      getChannelData: () => data,
    } as unknown as AudioBuffer;
  });
  createBufferSource = vi.fn(() => {
    const src = new MockBufferSource();
    this.bufferSources.push(src);
    return src as unknown as AudioBufferSourceNode;
  });
  createBiquadFilter = vi.fn(() => {
    return new MockBiquadFilter() as unknown as BiquadFilterNode;
  });
}

class MockUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

describe('SoundEngine', () => {
  let activeCtx: MockAudioContext | null = null;
  let spokenUtterances: MockUtterance[] = [];
  let speechMock: {
    getVoices: ReturnType<typeof vi.fn>;
    speak: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
  };
  let voicesChangedHandler: (() => void) | null = null;

  function installBrowserMocks(options?: {
    voices?: Partial<SpeechSynthesisVoice>[];
    initialCtxState?: AudioContextState;
    useWebkitOnly?: boolean;
    noAudioContext?: boolean;
    noSpeech?: boolean;
  }) {
    activeCtx = null;
    spokenUtterances = [];
    voicesChangedHandler = null;

    if (options?.noAudioContext) {
      delete (window as unknown as Record<string, unknown>).AudioContext;
      delete (window as unknown as Record<string, unknown>).webkitAudioContext;
    } else {
      const AudioCtxCtor = vi.fn(function AudioCtxFactory() {
        const ctx = new MockAudioContext();
        ctx.state = options?.initialCtxState ?? 'running';
        activeCtx = ctx;
        return ctx;
      });
      if (options?.useWebkitOnly) {
        delete (window as unknown as Record<string, unknown>).AudioContext;
        (window as unknown as Record<string, unknown>).webkitAudioContext = AudioCtxCtor;
      } else {
        (window as unknown as Record<string, unknown>).AudioContext = AudioCtxCtor;
        delete (window as unknown as Record<string, unknown>).webkitAudioContext;
      }
    }

    if (options?.noSpeech) {
      delete (window as unknown as Record<string, unknown>).speechSynthesis;
    } else {
      speechMock = {
        getVoices: vi.fn(() => (options?.voices ?? []) as SpeechSynthesisVoice[]),
        speak: vi.fn((utt: MockUtterance) => {
          spokenUtterances.push(utt);
        }),
        cancel: vi.fn(),
        addEventListener: vi.fn((event: string, cb: () => void) => {
          if (event === 'voiceschanged') voicesChangedHandler = cb;
        }),
      };
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        writable: true,
        value: speechMock,
      });
      Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
        configurable: true,
        writable: true,
        value: MockUtterance,
      });
    }
  }

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('unlocks AudioContext, resumes suspended state, primes iOS speech once, and runs music loop', async () => {
    installBrowserMocks({
      initialCtxState: 'suspended',
      voices: [
        { lang: 'fr-FR', name: 'Thomas' },
        { lang: 'en-US', name: 'Samantha' },
      ],
    });

    const { soundEngine } = await import('./soundEngine');
    soundEngine.unlock();

    expect(activeCtx).not.toBeNull();
    expect(activeCtx!.resume).toHaveBeenCalledTimes(1);
    expect(spokenUtterances).toHaveLength(1);
    expect(spokenUtterances[0].text).toBe('');
    expect(spokenUtterances[0].volume).toBe(0);

    // Second unlock should not re-prime speech
    soundEngine.unlock();
    expect(spokenUtterances).toHaveLength(1);

    // Step through full 32-step pop loop (kicks, claps, bass, chords, melody)
    soundEngine.setPartyBoost(true);
    vi.advanceTimersByTime(127 * 33);

    expect(activeCtx!.oscillators.length).toBeGreaterThan(40);
    expect(activeCtx!.bufferSources.length).toBeGreaterThan(0);

    // Disable and re-enable music
    const countBeforeStop = activeCtx!.oscillators.length;
    soundEngine.setMusicEnabled(false);
    vi.advanceTimersByTime(127 * 5);
    expect(activeCtx!.oscillators.length).toBe(countBeforeStop);

    soundEngine.setMusicEnabled(true);
    vi.advanceTimersByTime(127 * 4);
    expect(activeCtx!.oscillators.length).toBeGreaterThan(countBeforeStop);
    soundEngine.setMusicEnabled(false);
  });

  it('supports webkitAudioContext fallback and handles missing AudioContext safely', async () => {
    installBrowserMocks({ useWebkitOnly: true });
    const mod1 = await import('./soundEngine');
    mod1.soundEngine.playTap();
    expect(activeCtx).not.toBeNull();
    expect(activeCtx!.oscillators).toHaveLength(1);

    vi.resetModules();
    installBrowserMocks({ noAudioContext: true, noSpeech: true });
    const mod2 = await import('./soundEngine');
    expect(() => {
      mod2.soundEngine.unlock();
      mod2.soundEngine.playTap();
      mod2.soundEngine.playCount(0);
      mod2.soundEngine.playCorrect();
      mod2.soundEngine.playWrong();
      mod2.soundEngine.playChickenBawk();
      mod2.soundEngine.playRaccoonChase();
      mod2.soundEngine.playPrankFakeout();
      mod2.soundEngine.playSixSevenGiggle();
      mod2.soundEngine.playGwimaArrival();
      mod2.soundEngine.playGwimaBlast();
      mod2.soundEngine.playBambooRain();
      mod2.soundEngine.playWinFanfare();
      mod2.soundEngine.stopSpeech();
    }).not.toThrow();
  });

  it('synthesizes every cartoon SFX method without error', async () => {
    installBrowserMocks();
    const { soundEngine } = await import('./soundEngine');

    soundEngine.playTap();
    soundEngine.playCount(0);
    soundEngine.playCount(9);
    soundEngine.playCorrect();
    soundEngine.playWrong();
    soundEngine.playChickenBawk();
    soundEngine.playRaccoonChase();
    soundEngine.playPrankFakeout();
    soundEngine.playSixSevenGiggle();
    soundEngine.playGwimaArrival();
    soundEngine.playGwimaBlast();
    soundEngine.playBambooRain();
    soundEngine.playWinFanfare();

    expect(activeCtx).not.toBeNull();
    expect(activeCtx!.oscillators.length).toBeGreaterThan(50);
  });

  it('selects voices via voiceschanged, ducks music during speech, and fires onEnd', async () => {
    installBrowserMocks({
      voices: [{ lang: 'en-GB', name: 'Daniel' }],
    });

    const { soundEngine } = await import('./soundEngine');

    // Simulate voiceschanged updating to a preferred en-US voice
    speechMock.getVoices.mockReturnValue([
      { lang: 'en-US', name: 'Google US English' } as SpeechSynthesisVoice,
    ]);
    voicesChangedHandler?.();

    const onEnd = vi.fn();
    soundEngine.unlock();
    soundEngine.speak('Hello math superstar!', { rate: 0.9, pitch: 1.2, onEnd });

    const spoken = spokenUtterances[spokenUtterances.length - 1];
    expect(speechMock.cancel).toHaveBeenCalled();
    expect(spoken.text).toBe('Hello math superstar!');
    expect(spoken.rate).toBe(0.9);
    expect(spoken.pitch).toBe(1.2);
    expect(spoken.voice?.name).toBe('Google US English');

    // Step music while ducked
    vi.advanceTimersByTime(127 * 2);

    // Finish speech
    spoken.onend?.();
    expect(onEnd).toHaveBeenCalledTimes(1);

    // Test onerror clears ducking cleanly
    soundEngine.speak('Second line');
    const second = spokenUtterances[spokenUtterances.length - 1];
    second.onerror?.();

    // Test safety duck timer fallback when neither onend nor onerror fires
    soundEngine.speak('Third line');
    vi.advanceTimersByTime(5000);

    // Disabling voice stops speech and immediately calls onEnd on future speak calls
    soundEngine.setVoiceEnabled(false);
    expect(speechMock.cancel).toHaveBeenCalled();
    const disabledEnd = vi.fn();
    soundEngine.speak('Muted line', { onEnd: disabledEnd });
    expect(disabledEnd).toHaveBeenCalledTimes(1);

    soundEngine.setMusicEnabled(false);
  });

  it('recovers cleanly when speechSynthesis throws during unlock, speak, or cancel', async () => {
    installBrowserMocks({
      voices: [{ lang: 'en-US', name: 'Default US' }],
    });
    speechMock.speak.mockImplementation(() => {
      throw new Error('speech unavailable');
    });
    speechMock.cancel.mockImplementation(() => {
      throw new Error('cancel failed');
    });

    const { soundEngine } = await import('./soundEngine');
    const onEnd = vi.fn();
    expect(() => soundEngine.unlock()).not.toThrow();
    expect(() => soundEngine.speak('Try speaking', { onEnd })).not.toThrow();
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(() => soundEngine.stopSpeech()).not.toThrow();
    soundEngine.setMusicEnabled(false);
  });
});
