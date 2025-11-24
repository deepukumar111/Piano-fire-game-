class AudioEngine {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private isMuted: boolean = false;
  private melodyIndex = 0;
  
  // Melody: Twinkle Twinkle Little Star (plus extra notes to loop nicely)
  // C4, D4, E4, F4, G4, A4
  private melody = [
    261.63, 261.63, 392.00, 392.00, 440.00, 440.00, 392.00, // Twinkle twinkle little star
    349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63, // How I wonder what you are
    392.00, 392.00, 349.23, 349.23, 329.63, 329.63, 293.66, // Up above the world so high
    392.00, 392.00, 349.23, 349.23, 329.63, 329.63, 293.66, // Like a diamond in the sky
    261.63, 261.63, 392.00, 392.00, 440.00, 440.00, 392.00, // Twinkle twinkle little star
    349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63  // How I wonder what you are
  ];

  constructor() {
    try {
      // Defer initialization until user interaction
    } catch (e) {
      console.error("Audio API not supported", e);
    }
  }

  init(bpm: number) {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
      this.gainNode.gain.value = 0.3; // Global volume
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    // Reset song position when level starts
    this.melodyIndex = 0;
  }

  playHitSound(lane: number) {
    if (!this.ctx || !this.gainNode || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    
    // Play next note in the song
    const freq = this.melody[this.melodyIndex % this.melody.length];
    this.melodyIndex++;

    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    // Envelope
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4); // Slightly longer sustain for melody

    osc.connect(gain);
    gain.connect(this.gainNode);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  playMissSound() {
    if (!this.ctx || !this.gainNode || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.gainNode);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const audioService = new AudioEngine();