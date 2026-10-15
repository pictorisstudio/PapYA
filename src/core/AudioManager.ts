import Phaser from 'phaser'
import { AUDIO_CONFIG, AUDIO_GAIN, audioPath, type AudioKey } from '../config/audioConfig'

type PlayableSound = Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound

export default class AudioManager {
  private muted = false
  private musicVolume = 0.29925
  private sfxVolume = 1
  private music?: PlayableSound
  private readonly effects = new Set<PlayableSound>()

  // La carga anticipada evita esperas de red entre minijuegos.
  preload(scene: Phaser.Scene, keys: readonly AudioKey[]): void {
    for (const key of new Set(keys)) {
      if (!scene.cache.audio.exists(key)) scene.load.audio(key, audioPath(key))
    }
  }

  playMusic(scene: Phaser.Scene, key: AudioKey): boolean {
    this.stopMusic()
    if (AUDIO_CONFIG[key].kind !== 'music' || !scene.cache?.audio?.exists(key)) return false
    if (scene.sound.locked) {
      scene.sound.once('unlocked', () => { if (scene.scene.isActive()) this.playMusic(scene, key) })
      return true
    }
    const music = scene.sound.add(key) as PlayableSound
    this.music = music
    music.play({ loop: true, volume: this.muted ? 0 : this.musicVolume })
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.music === music) this.stopMusic()
    })
    return true
  }

  playEffect(scene: Phaser.Scene, key: AudioKey, loop = false, finishAfterScene = false): boolean {
    if (AUDIO_CONFIG[key].kind !== 'sfx' || !scene.cache?.audio?.exists(key)) return false
    if ([...this.effects].some(effect => effect.key === key)) return false
    const effect = scene.sound.add(key) as PlayableSound
    this.effects.add(effect)
    const cleanup = () => {
      scene.events.off(Phaser.Scenes.Events.SHUTDOWN, cleanup)
      this.effects.delete(effect)
      effect.destroy()
    }
    effect.once('complete', cleanup)
    if (!finishAfterScene || loop) scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup)
    effect.play({ loop, volume: this.effectVolume(key) })
    return true
  }

  stopMusic(): void {
    this.music?.destroy()
    this.music = undefined
  }

  private applyVolumes(): void {
    this.music?.setVolume(this.muted ? 0 : this.musicVolume)
    for (const effect of this.effects) effect.setVolume(this.effectVolume(effect.key as AudioKey))
  }

  private effectVolume(key: AudioKey): number {
    return this.muted ? 0 : Phaser.Math.Clamp(this.sfxVolume * (AUDIO_GAIN[key] ?? 1), 0, 1)
  }

  setMuted(value: boolean): void {
    this.muted = value
    this.applyVolumes()
  }

  setMusicVolume(value: number): void {
    this.musicVolume = Phaser.Math.Clamp(value, 0, 1)
    this.applyVolumes()
  }

  setSfxVolume(value: number): void {
    this.sfxVolume = Phaser.Math.Clamp(value, 0, 1)
    this.applyVolumes()
  }

  get settings() {
    return {
      muted: this.muted,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
    }
  }
}
