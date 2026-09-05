export default class AudioManager {
  private muted = false
  private musicVolume = 0.7
  private sfxVolume = 0.8

  setMuted(value: boolean): void {
    this.muted = value
  }

  setMusicVolume(value: number): void {
    this.musicVolume = Phaser.Math.Clamp(value, 0, 1)
  }

  setSfxVolume(value: number): void {
    this.sfxVolume = Phaser.Math.Clamp(value, 0, 1)
  }

  get settings() {
    return {
      muted: this.muted,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
    }
  }
}
