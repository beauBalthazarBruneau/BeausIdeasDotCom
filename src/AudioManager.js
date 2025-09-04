import { Howl, Howler } from 'howler';

export class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.music = null;
    this.sfxVolume = 0.7;
    this.musicVolume = 0.5;
    this.muted = false;
    this.initialized = false;
    
    // Audio context management for browser policies
    this.audioContextUnlocked = false;
    this.pendingSounds = [];
    
    // Setup user gesture handler for audio policy compliance
    this.setupAudioUnlocking();
    
    // Load audio assets
    this.loadAudioAssets();
  }

  setupAudioUnlocking() {
    // Modern browsers require user interaction before playing audio
    const unlockAudio = () => {
      if (this.audioContextUnlocked) return;
      
      // Create and play a silent audio to unlock the context
      const silent = new Howl({
        src: ['data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='],
        volume: 0,
        onend: () => {
          this.audioContextUnlocked = true;
          console.log('Audio context unlocked!');
          
          // Play any pending sounds
          this.pendingSounds.forEach(callback => callback());
          this.pendingSounds = [];
          
          // Start background music if not muted
          if (!this.muted && this.music) {
            console.log('Starting background music...');
            this.music.play();
          }
        }
      });
      silent.play();
      
      // Remove listeners
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
    
    // Add event listeners for user interaction
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
  }

  loadAudioAssets() {
    // For now, we'll create programmatic audio since we don't have audio files
    // In a real project, you'd load actual audio files here
    
    // Background music - simple ambient loop (placeholder)
    this.music = new Howl({
      src: [this.generateAmbientMusicDataURL()], // Generate a more pleasant ambient music
      loop: true,
      volume: this.musicVolume,
      autoplay: false, // Don't autoplay due to browser policies
      onload: () => {
        console.log('Background music loaded');
      },
      onloaderror: (id, error) => {
        console.warn('Failed to load background music:', error);
      },
      onplay: () => {
        console.log('Background music started playing');
      },
      onpause: () => {
        console.log('Background music paused');
      }
    });
    
    // Sound effects
    this.loadSoundEffect('jump', this.generateToneDataURL(440, 0.2, 0.3, 'square'));
    this.loadSoundEffect('doubleJump', this.generateToneDataURL(660, 0.15, 0.25, 'triangle'));
    this.loadSoundEffect('land', this.generateToneDataURL(220, 0.1, 0.2, 'sawtooth'));
    this.loadSoundEffect('death', this.generateToneDataURL(165, 0.5, 0.4, 'sawtooth'));
    this.loadSoundEffect('respawn', this.generateToneDataURL(880, 0.3, 0.3, 'sine'));
    
    this.initialized = true;
  }

  loadSoundEffect(name, src) {
    const sound = new Howl({
      src: [src],
      volume: this.sfxVolume,
      preload: true,
      onload: () => {
        console.log(`Sound effect '${name}' loaded`);
      },
      onloaderror: (id, error) => {
        console.warn(`Failed to load sound effect '${name}':`, error);
      }
    });
    
    this.sounds.set(name, sound);
  }

  // Generate simple tones for placeholder audio (since we don't have audio files)
  generateToneDataURL(frequency, duration, volume = 0.5, waveType = 'sine') {
    const sampleRate = 44100;
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate audio samples
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      let sample;
      
      switch (waveType) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
        case 'triangle':
          sample = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
          break;
        case 'sawtooth':
          sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
          break;
        default:
          sample = Math.sin(2 * Math.PI * frequency * t);
      }
      
      // Apply envelope and volume
      const envelope = Math.max(0, 1 - (t / duration));
      sample *= volume * envelope;
      
      // Convert to 16-bit PCM
      const intSample = Math.max(-32768, Math.min(32767, sample * 32767));
      view.setInt16(44 + i * 2, intSample, true);
    }
    
    // Convert to data URL
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'data:audio/wav;base64,' + btoa(binary);
  }

  // Generate more pleasant ambient music with multiple harmonies
  generateAmbientMusicDataURL() {
    const sampleRate = 44100;
    const duration = 4; // 4 seconds for a loop
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate ambient music with harmonies
    // C major chord progression: C - F - G - C (peaceful and soothing)
    const chordFreqs = [
      [261.63, 329.63, 392.00], // C major (C-E-G)
      [174.61, 220.00, 261.63], // F major (F-A-C)
      [196.00, 246.94, 293.66], // G major (G-B-D)
      [261.63, 329.63, 392.00]  // C major (C-E-G)
    ];
    
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const chordIndex = Math.floor((t / duration) * 4) % 4;
      const chordProgress = ((t / duration) * 4) % 1;
      
      let sample = 0;
      
      // Add each note in the chord with slight detuning for richness
      chordFreqs[chordIndex].forEach((freq, index) => {
        const detune = 1 + (Math.sin(t * 0.5) * 0.002); // Very slight vibrato
        const noteFreq = freq * detune;
        
        // Use different waveforms for different voices
        let noteSample;
        switch (index) {
          case 0: // Bass note - sine wave
            noteSample = Math.sin(2 * Math.PI * noteFreq * t);
            break;
          case 1: // Mid note - triangle wave (softer)
            noteSample = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * noteFreq * t));
            break;
          case 2: // High note - sine with harmonics
            noteSample = Math.sin(2 * Math.PI * noteFreq * t) * 0.7 + 
                        Math.sin(2 * Math.PI * noteFreq * 2 * t) * 0.2;
            break;
          default:
            noteSample = Math.sin(2 * Math.PI * noteFreq * t);
        }
        
        // Volume envelope for smooth transitions between chords
        const envelope = 0.5 + 0.5 * Math.cos(2 * Math.PI * chordProgress);
        const noteVolume = (index === 0 ? 0.15 : 0.08) * envelope; // Bass louder
        
        sample += noteSample * noteVolume;
      });
      
      // Apply overall volume and smooth out any harsh transitions
      const overallVolume = 0.3; // Quiet background music
      sample *= overallVolume;
      
      // Convert to 16-bit PCM
      const intSample = Math.max(-32768, Math.min(32767, sample * 32767));
      view.setInt16(44 + i * 2, intSample, true);
    }
    
    // Convert to data URL
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'data:audio/wav;base64,' + btoa(binary);
  }

  // Public methods for playing sounds
  playSound(soundName, options = {}) {
    if (!this.initialized || this.muted) return;
    
    const sound = this.sounds.get(soundName);
    if (!sound) {
      console.warn(`Sound '${soundName}' not found`);
      return;
    }
    
    const playCallback = () => {
      // Apply any options
      if (options.volume !== undefined) {
        sound.volume(options.volume * this.sfxVolume);
      } else {
        sound.volume(this.sfxVolume);
      }
      
      if (options.rate !== undefined) {
        sound.rate(options.rate);
      }
      
      sound.play();
    };
    
    if (!this.audioContextUnlocked) {
      this.pendingSounds.push(playCallback);
    } else {
      playCallback();
    }
  }

  // Convenience methods for specific sounds
  playJump() {
    this.playSound('jump');
  }

  playDoubleJump() {
    this.playSound('doubleJump', { rate: 1.2 });
  }

  playLand() {
    this.playSound('land');
  }

  playDeath() {
    this.playSound('death', { rate: 0.8 });
  }

  playRespawn() {
    this.playSound('respawn');
  }

  // Music control
  startBackgroundMusic() {
    if (!this.music || this.muted) return;
    
    if (this.audioContextUnlocked) {
      this.music.play();
    } else {
      this.pendingSounds.push(() => this.music.play());
    }
  }

  stopBackgroundMusic() {
    if (this.music) {
      this.music.stop();
    }
  }

  pauseBackgroundMusic() {
    if (this.music) {
      this.music.pause();
    }
  }

  resumeBackgroundMusic() {
    if (this.music && !this.muted) {
      this.music.play();
    }
  }

  // Volume controls
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    
    // Update all sound effects
    this.sounds.forEach(sound => {
      sound.volume(this.sfxVolume);
    });
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    if (this.music) {
      this.music.volume(this.musicVolume);
    }
  }

  getSFXVolume() {
    return this.sfxVolume;
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  // Mute controls
  toggleMute() {
    this.setMuted(!this.muted);
  }

  setMuted(muted) {
    this.muted = muted;
    
    if (muted) {
      Howler.mute(true);
    } else {
      Howler.mute(false);
      // Resume background music if it was playing
      if (this.music && !this.music.playing()) {
        this.startBackgroundMusic();
      }
    }
  }

  isMuted() {
    return this.muted;
  }

  // Game state management
  onGamePause() {
    this.pauseBackgroundMusic();
  }

  onGameResume() {
    this.resumeBackgroundMusic();
  }

  onGameStart() {
    this.startBackgroundMusic();
  }

  onGameEnd() {
    this.stopBackgroundMusic();
  }

  // Cleanup
  destroy() {
    // Stop all sounds
    this.sounds.forEach(sound => {
      sound.stop();
      sound.unload();
    });
    
    if (this.music) {
      this.music.stop();
      this.music.unload();
    }
    
    this.sounds.clear();
    this.music = null;
  }
}
