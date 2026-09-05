import type { StorageAdapter } from './StorageAdapter'

export default class WebStorageAdapter implements StorageAdapter {
  read(key: string): string | null {
    return window.localStorage.getItem(key)
  }

  write(key: string, value: string): void {
    window.localStorage.setItem(key, value)
  }

  remove(key: string): void {
    window.localStorage.removeItem(key)
  }

  has(key: string): boolean {
    return window.localStorage.getItem(key) !== null
  }
}
