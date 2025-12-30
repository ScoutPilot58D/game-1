// Procedural sound effects using Web Audio API
// No audio files needed - generates retro-style sounds

export default class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
  }

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  // Resume audio context (needed after user interaction)
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Play a flap sound - wing flap with whoosh
  flap() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    // Whoosh (filtered noise)
    const bufferSize = this.audioContext.sampleRate * 0.15;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    // Filter to make it more whoosh-like
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.12);
    filter.Q.value = 1;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.25, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);

    noise.start();
    noise.stop(this.audioContext.currentTime + 0.15);

    // Add a subtle thump for the wing beat
    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();
    osc.connect(oscGain);
    oscGain.connect(this.audioContext.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.audioContext.currentTime + 0.08);
    oscGain.gain.setValueAtTime(0.12, this.audioContext.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.08);
  }

  // Enemy defeat - thud + squawk
  enemyDefeat() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    // Thud
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(this.audioContext.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(150, this.audioContext.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.15);
    gain1.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    osc1.start();
    osc1.stop(this.audioContext.currentTime + 0.15);

    // Squawk
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(this.audioContext.destination);
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.2);
    gain2.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    osc2.start();
    osc2.stop(this.audioContext.currentTime + 0.2);
  }

  // Player death - dramatic descending tone
  playerDeath() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.5);

    gain.gain.setValueAtTime(0.25, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.5);
  }

  // Egg collect - crack sound only
  eggCollect() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    // Crack sound (short noise burst)
    const bufferSize = this.audioContext.sampleRate * 0.08;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize); // Decaying noise
    }
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1500;

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.35, this.audioContext.currentTime);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.audioContext.destination);
    noise.start();
    noise.stop(this.audioContext.currentTime + 0.08);
  }

  // Egg hatch - crack + chirp
  eggHatch() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    // Crack (noise burst)
    const bufferSize = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.audioContext.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(this.audioContext.destination);
    noiseGain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    noise.start();
    noise.stop(this.audioContext.currentTime + 0.1);

    // Chirp
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.1);
    osc.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.15);
    osc.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.2);
    gain.gain.setValueAtTime(0.01, this.audioContext.currentTime);
    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);
    osc.start(this.audioContext.currentTime + 0.1);
    osc.stop(this.audioContext.currentTime + 0.25);
  }

  // Wave complete - triumphant jingle
  waveComplete() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    const duration = 0.15;

    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * duration);
      gain.gain.setValueAtTime(0.01, this.audioContext.currentTime);
      gain.gain.setValueAtTime(0.15, this.audioContext.currentTime + i * duration);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * duration + duration);
      osc.start(this.audioContext.currentTime + i * duration);
      osc.stop(this.audioContext.currentTime + i * duration + duration);
    });
  }

  // Lava bubble - gurgle
  lavaBubble() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, this.audioContext.currentTime);
    osc.frequency.setValueAtTime(120, this.audioContext.currentTime + 0.05);
    osc.frequency.setValueAtTime(60, this.audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.15);
  }

  // Lava hand rising - dramatic rising sound (kept for compatibility)
  lavaHandRise() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.4);

    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.5);
  }

  // Flame eruption - whooshing fire sound
  flameErupt() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    // Noise-based whoosh for fire
    const bufferSize = this.audioContext.sampleRate * 0.6;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter for fire-like sound
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.15);
    filter.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.5);
    filter.Q.value = 2;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.01, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, this.audioContext.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);

    noise.start();
    noise.stop(this.audioContext.currentTime + 0.6);

    // Add a low rumble
    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();
    osc.connect(oscGain);
    oscGain.connect(this.audioContext.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.4);
    oscGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.5);
  }

  // Extra life - happy sound
  extraLife() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const notes = [523, 659, 784, 1047, 784, 1047]; // Ascending arpeggio
    const duration = 0.1;

    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * duration);
      gain.gain.setValueAtTime(0.01, this.audioContext.currentTime);
      gain.gain.setValueAtTime(0.2, this.audioContext.currentTime + i * duration);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * duration + duration * 0.9);
      osc.start(this.audioContext.currentTime + i * duration);
      osc.stop(this.audioContext.currentTime + i * duration + duration);
    });
  }

  // ============ RETRO ARCADE GAME MUSIC ============

  startMusic(wave = 1) {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    this.stopMusic();
    this.musicPlaying = true;
    this.currentWave = wave;
    this.musicStep = 0;
    this.melodyIndex = 0;

    // Classic arcade tempo
    this.bpm = Math.min(140, 120 + wave * 2);
    this.stepTime = (60 / this.bpm) / 4; // 16th notes

    // Lower master volume
    this.musicGain = this.audioContext.createGain();
    this.musicGain.gain.value = 0.08;
    this.musicGain.connect(this.audioContext.destination);

    // Define melodic patterns (different phrases that cycle)
    this.melodyPatterns = [
      // Pattern A - main theme
      [392, 0, 440, 0, 494, 0, 523, 0, 494, 0, 440, 0, 392, 0, 0, 0],
      // Pattern B - variation
      [523, 0, 494, 0, 440, 392, 440, 0, 494, 0, 523, 0, 587, 0, 0, 0],
      // Pattern C - bridge
      [330, 392, 440, 0, 330, 392, 494, 0, 330, 392, 523, 494, 440, 0, 0, 0],
      // Pattern D - tension
      [587, 0, 523, 0, 587, 0, 659, 0, 587, 523, 494, 440, 392, 0, 0, 0],
    ];

    this.bassPatterns = [
      // Bass A
      [98, 0, 0, 98, 0, 0, 131, 0, 98, 0, 0, 98, 147, 0, 131, 0],
      // Bass B
      [131, 0, 0, 131, 0, 0, 98, 0, 131, 0, 147, 0, 165, 0, 147, 0],
    ];

    this.currentMelodyPattern = 0;
    this.currentBassPattern = 0;
    this.patternStep = 0;
    this.measureCount = 0;

    this.scheduleStep();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimeout) clearTimeout(this.musicTimeout);
    if (this.musicGain) {
      try {
        this.musicGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
      } catch(e) {}
    }
  }

  scheduleStep() {
    if (!this.musicPlaying || !this.audioContext) return;

    const melody = this.melodyPatterns[this.currentMelodyPattern];
    const bass = this.bassPatterns[this.currentBassPattern];

    // Play melody note
    const melodyNote = melody[this.patternStep];
    if (melodyNote > 0) {
      this.playChipNote(melodyNote, 'square', 0.12, this.stepTime * 1.5);
    }

    // Play bass note
    const bassNote = bass[this.patternStep];
    if (bassNote > 0) {
      this.playChipNote(bassNote, 'triangle', 0.15, this.stepTime * 2);
    }

    // Simple percussion on certain beats
    if (this.patternStep % 4 === 0) {
      this.playChipDrum('kick');
    }
    if (this.patternStep % 4 === 2) {
      this.playChipDrum('snare');
    }
    if (this.patternStep % 2 === 0) {
      this.playChipDrum('hat');
    }

    // Advance pattern
    this.patternStep++;
    if (this.patternStep >= 16) {
      this.patternStep = 0;
      this.measureCount++;

      // Change patterns every 2 measures for variety
      if (this.measureCount % 2 === 0) {
        this.currentMelodyPattern = (this.currentMelodyPattern + 1) % this.melodyPatterns.length;
      }
      if (this.measureCount % 4 === 0) {
        this.currentBassPattern = (this.currentBassPattern + 1) % this.bassPatterns.length;
      }
    }

    this.musicTimeout = setTimeout(() => this.scheduleStep(), this.stepTime * 1000);
  }

  playChipNote(freq, type, volume, duration) {
    const now = this.audioContext.currentTime;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    // Classic chip envelope
    gain.gain.setValueAtTime(volume, now);
    gain.gain.setValueAtTime(volume * 0.7, now + duration * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  playChipDrum(type) {
    const now = this.audioContext.currentTime;

    if (type === 'kick') {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.1);
    }
    else if (type === 'snare') {
      // Noise burst
      const bufferSize = this.audioContext.sampleRate * 0.06;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.audioContext.createBufferSource();
      noise.buffer = buffer;
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 2000;
      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);
      noise.start(now);
      noise.stop(now + 0.06);
    }
    else if (type === 'hat') {
      const bufferSize = this.audioContext.sampleRate * 0.02;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.audioContext.createBufferSource();
      noise.buffer = buffer;
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 8000;
      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);
      noise.start(now);
      noise.stop(now + 0.02);
    }
  }

  setMusicVolume(volume) {
    if (this.musicGain) {
      this.musicGain.gain.value = volume;
    }
  }

  updateMusicIntensity(wave) {
    this.currentWave = wave;
    this.bpm = Math.min(140, 120 + wave * 2);
    this.stepTime = (60 / this.bpm) / 4;
  }
}

// Singleton instance
export const soundManager = new SoundManager();
