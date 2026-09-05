import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.papya.game',
  appName: 'PapYA',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
