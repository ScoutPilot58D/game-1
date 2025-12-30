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

  // Lava hand rising - dramatic rising sound
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
}

// Singleton instance
export const soundManager = new SoundManager();
