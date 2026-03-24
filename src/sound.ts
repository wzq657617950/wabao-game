class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (!this.enabled || !this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playDig() {
    if (!this.enabled || !this.ctx) return;
    // Thud sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playCoin() {
    this.playTone(1200, 'sine', 0.3, 0.1);
    setTimeout(() => this.playTone(1600, 'sine', 0.4, 0.1), 100);
  }

  playGem() {
    this.playTone(800, 'sine', 0.1, 0.1);
    setTimeout(() => this.playTone(1200, 'sine', 0.1, 0.1), 100);
    setTimeout(() => this.playTone(1600, 'sine', 0.4, 0.1), 200);
  }

  playRareGem() {
    this.playTone(600, 'square', 0.1, 0.1);
    setTimeout(() => this.playTone(800, 'square', 0.1, 0.1), 100);
    setTimeout(() => this.playTone(1200, 'square', 0.1, 0.1), 200);
    setTimeout(() => this.playTone(1600, 'square', 0.4, 0.1), 300);
  }

  playLevelUp() {
    if (!this.enabled || !this.ctx) return;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'square', 0.3, 0.1), i * 150);
    });
  }

  playClick() {
    this.playTone(600, 'sine', 0.05, 0.05);
  }
}

export const soundManager = new SoundManager();
