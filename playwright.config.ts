import { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  testDir: './tests',
  maxFailures: 2,
  timeout: 4000,
}

export default config
