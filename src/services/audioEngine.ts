/**
 * Web Audio and Speech Synthesis Engine for StoryNook
 * Provides speech narration synchronized with story transcripts,
 * plus multi-channel procedural ambient sound generators (Rain, Campfire, Waves, Wind, Warm Drone).
 */

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private ambientGains: Map<string, GainNode> = new Map();
  private ambientSources: Map<string, { stop: () => void }> = new Map();

  // Audio Element State (Strictly real uploaded audio files - NO AI text-to-speech)
  private htmlAudio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private isAudioPlaying = false;
  private isAudioPaused = false;
  private playbackRate = 1.0;
  private currentTime = 0;
  private totalDuration = 0;
  private activeStoryLines: { time: number; text: string }[] = [];
  private currentLineIndex = 0;
  
  // Callbacks
  private onTimeUpdateCallback: ((time: number, lineIndex: number) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private onStateChangeCallback: ((isPlaying: boolean) => void) | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // --- AMBIENT SOUND GENERATORS (Web Audio API) ---

  public setAmbientVolume(soundId: string, volume: number) {
    this.initAudioContext();
    const gainNode = this.ambientGains.get(soundId);
    if (gainNode && this.audioCtx) {
      gainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.audioCtx.currentTime, 0.05);
    }
  }

  public startAmbientSound(soundId: string, initialVolume = 0.3) {
    this.initAudioContext();
    if (!this.audioCtx) return;

    if (this.ambientSources.has(soundId)) {
      this.setAmbientVolume(soundId, initialVolume);
      return;
    }

    const masterGain = this.audioCtx.createGain();
    masterGain.gain.setValueAtTime(initialVolume, this.audioCtx.currentTime);
    masterGain.connect(this.audioCtx.destination);
    this.ambientGains.set(soundId, masterGain);

    switch (soundId) {
      case 'rain':
        this.createRainGenerator(masterGain);
        break;
      case 'campfire':
        this.createCampfireGenerator(masterGain);
        break;
      case 'ocean':
        this.createOceanGenerator(masterGain);
        break;
      case 'forest':
        this.createForestWindGenerator(masterGain);
        break;
      case 'drone':
        this.createLoFiDroneGenerator(masterGain);
        break;
      default:
        break;
    }
  }

  public stopAmbientSound(soundId: string) {
    const sourceObj = this.ambientSources.get(soundId);
    if (sourceObj) {
      try {
        sourceObj.stop();
      } catch (e) {
        console.warn('Error stopping sound source', e);
      }
      this.ambientSources.delete(soundId);
    }
    const gain = this.ambientGains.get(soundId);
    if (gain) {
      gain.disconnect();
      this.ambientGains.delete(soundId);
    }
  }

  public stopAllAmbients() {
    for (const [id] of this.ambientSources) {
      this.stopAmbientSound(id);
    }
  }

  private createNoiseBuffer(duration = 2): AudioBuffer {
    if (!this.audioCtx) throw new Error('No AudioContext');
    const bufferSize = this.audioCtx.sampleRate * duration;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Rain: Filtered noise with continuous soft patter
  private createRainGenerator(targetGain: GainNode) {
    if (!this.audioCtx) return;
    const noiseBuffer = this.createNoiseBuffer(3);
    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, this.audioCtx.currentTime);

    const highpass = this.audioCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(200, this.audioCtx.currentTime);

    noiseSource.connect(filter);
    filter.connect(highpass);
    highpass.connect(targetGain);
    noiseSource.start();

    this.ambientSources.set('rain', {
      stop: () => {
        try { noiseSource.stop(); } catch {}
        noiseSource.disconnect();
        filter.disconnect();
        highpass.disconnect();
      }
    });
  }

  // Campfire: Low warm rumble with gentle high crackles
  private createCampfireGenerator(targetGain: GainNode) {
    if (!this.audioCtx) return;
    const noiseBuffer = this.createNoiseBuffer(2);
    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const lowpass = this.audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(320, this.audioCtx.currentTime);

    noiseSource.connect(lowpass);
    lowpass.connect(targetGain);
    noiseSource.start();

    // Occasional crackle interval
    const interval = window.setInterval(() => {
      if (!this.audioCtx || this.ambientSources.get('campfire') === undefined) return;
      if (Math.random() > 0.4) {
        const osc = this.audioCtx.createOscillator();
        const popGain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150 + Math.random() * 600, this.audioCtx.currentTime);
        popGain.gain.setValueAtTime(0.08 * Math.random(), this.audioCtx.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.08);
        osc.connect(popGain);
        popGain.connect(targetGain);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.09);
      }
    }, 250);

    this.ambientSources.set('campfire', {
      stop: () => {
        clearInterval(interval);
        try { noiseSource.stop(); } catch {}
        noiseSource.disconnect();
        lowpass.disconnect();
      }
    });
  }

  // Ocean: Rolling swell oscillator modulating noise
  private createOceanGenerator(targetGain: GainNode) {
    if (!this.audioCtx) return;
    const noiseBuffer = this.createNoiseBuffer(4);
    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, this.audioCtx.currentTime);
    filter.Q.setValueAtTime(1.2, this.audioCtx.currentTime);

    const waveGain = this.audioCtx.createGain();
    waveGain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);

    // LFO for wave ebb and flow
    const lfo = this.audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, this.audioCtx.currentTime); // ~8 sec wave cycle
    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    noiseSource.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(targetGain);

    noiseSource.start();
    lfo.start();

    this.ambientSources.set('ocean', {
      stop: () => {
        try { noiseSource.stop(); lfo.stop(); } catch {}
        noiseSource.disconnect();
        lfo.disconnect();
        filter.disconnect();
        waveGain.disconnect();
      }
    });
  }

  // Forest & Wind: Gentle rustle and night breeze
  private createForestWindGenerator(targetGain: GainNode) {
    if (!this.audioCtx) return;
    const noiseBuffer = this.createNoiseBuffer(3);
    const noiseSource = this.audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, this.audioCtx.currentTime);
    filter.Q.setValueAtTime(2.0, this.audioCtx.currentTime);

    noiseSource.connect(filter);
    filter.connect(targetGain);
    noiseSource.start();

    this.ambientSources.set('forest', {
      stop: () => {
        try { noiseSource.stop(); } catch {}
        noiseSource.disconnect();
        filter.disconnect();
      }
    });
  }

  // Cosmic Lo-Fi Drone: Soft, ultra-warm meditative pad (D - A - F#)
  private createLoFiDroneGenerator(targetGain: GainNode) {
    if (!this.audioCtx) return;
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const osc3 = this.audioCtx.createOscillator();

    // Warm, soft sine waves with gentle detune for deep calm relaxation
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(73.42, this.audioCtx.currentTime); // D2
    osc2.type = 'sine'; // gentle sine instead of harsh triangle
    osc2.frequency.setValueAtTime(110.0, this.audioCtx.currentTime); // A2
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(185.0, this.audioCtx.currentTime); // F#3

    // Low-pass filter set low to remove any harshness, producing a warm velvet tone
    const droneFilter = this.audioCtx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(200, this.audioCtx.currentTime);
    droneFilter.Q.setValueAtTime(1.0, this.audioCtx.currentTime);

    // Lighter, subtle mix gain as requested by user
    const mixGain = this.audioCtx.createGain();
    mixGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);

    osc1.connect(droneFilter);
    osc2.connect(droneFilter);
    osc3.connect(droneFilter);
    droneFilter.connect(mixGain);
    mixGain.connect(targetGain);

    osc1.start();
    osc2.start();
    osc3.start();

    this.ambientSources.set('drone', {
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
          osc3.stop();
        } catch {}
        osc1.disconnect();
        osc2.disconnect();
        osc3.disconnect();
        droneFilter.disconnect();
      }
    });
  }

  // --- NARRATION ENGINE (Speech Synthesis & Timeline) ---

  public setCallbacks(
    onTimeUpdate: (time: number, lineIndex: number) => void,
    onEnd: () => void,
    onStateChange: (isPlaying: boolean) => void
  ) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndCallback = onEnd;
    this.onStateChangeCallback = onStateChange;
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    if (this.htmlAudio) {
      this.htmlAudio.playbackRate = rate;
    }
  }

  public loadStory(
    transcript: { time: number; text: string }[],
    totalDuration: number,
    startTime = 0,
    audioUrl?: string
  ) {
    this.stopNarration();
    this.activeStoryLines = transcript || [];
    this.totalDuration = totalDuration || 0;
    this.currentTime = startTime || 0;
    this.findLineIndexForTime(startTime || 0);

    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio.src = '';
      this.htmlAudio = null;
    }

    if (audioUrl) {
      this.currentAudioUrl = audioUrl;
      try {
        const audio = new Audio(audioUrl);
        audio.currentTime = startTime;
        audio.playbackRate = this.playbackRate;
        audio.preload = 'auto';

        audio.onloadedmetadata = () => {
          if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
            this.totalDuration = Math.round(audio.duration);
          }
        };

        audio.ontimeupdate = () => {
          if (!this.htmlAudio) return;
          this.currentTime = audio.currentTime;
          this.findLineIndexForTime(this.currentTime);
          if (this.onTimeUpdateCallback) {
            this.onTimeUpdateCallback(this.currentTime, this.currentLineIndex);
          }
        };

        audio.onended = () => {
          this.stopNarration();
          if (this.onEndCallback) this.onEndCallback();
        };

        audio.onerror = (e) => {
          console.warn('Real audio file playback error for URL:', audioUrl, e);
          this.isAudioPlaying = false;
          if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        };

        this.htmlAudio = audio;
      } catch (err) {
        console.warn('Could not initialize HTMLAudioElement for URL:', audioUrl, err);
        this.htmlAudio = null;
        this.currentAudioUrl = null;
      }
    } else {
      this.currentAudioUrl = null;
    }
  }

  private findLineIndexForTime(time: number) {
    let index = 0;
    for (let i = 0; i < this.activeStoryLines.length; i++) {
      if (time >= this.activeStoryLines[i].time) {
        index = i;
      } else {
        break;
      }
    }
    this.currentLineIndex = index;
    return index;
  }

  public play() {
    this.initAudioContext();

    // Play real audio file uploaded by creator or admin
    if (this.htmlAudio) {
      this.htmlAudio.playbackRate = this.playbackRate;
      this.htmlAudio.play().then(() => {
        this.isAudioPlaying = true;
        this.isAudioPaused = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(true);
      }).catch((err) => {
        console.warn('Audio play request failed or was interrupted:', err);
        this.isAudioPlaying = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
      });
      return;
    }

    console.warn('No original audio URL loaded for this story. Uploaded audio file is required for playback.');
    this.isAudioPlaying = false;
    this.isAudioPaused = false;
    if (this.onStateChangeCallback) this.onStateChangeCallback(false);
  }

  public pause() {
    this.isAudioPaused = true;
    this.isAudioPlaying = false;
    if (this.htmlAudio) {
      this.htmlAudio.pause();
    }
    if (this.onStateChangeCallback) this.onStateChangeCallback(false);
  }

  public seek(seconds: number) {
    const clamped = Math.max(0, Math.min(this.totalDuration, seconds));
    this.currentTime = clamped;
    if (this.htmlAudio) {
      this.htmlAudio.currentTime = clamped;
    }
    this.findLineIndexForTime(clamped);
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.currentTime, this.currentLineIndex);
    }
  }

  public stopNarration() {
    this.isAudioPlaying = false;
    this.isAudioPaused = false;
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio.currentTime = 0;
    }
    if (this.onStateChangeCallback) this.onStateChangeCallback(false);
  }

  public getCurrentTime() {
    return this.currentTime;
  }

  public getIsPlaying() {
    return this.isAudioPlaying;
  }
}

export const audioEngine = new AudioEngine();
