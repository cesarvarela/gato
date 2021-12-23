import { ElectronApplication, Page, _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import { clickMenuItemById, findLatestBuild, parseElectronApp } from './electron-playwright-helpers'

let electronApp: ElectronApplication

test.beforeAll(async () => {
  // find the latest build in the out directory
  const latestBuild = findLatestBuild()
  // parse the directory and find paths and other info
  const appInfo = parseElectronApp(latestBuild)
  // set the CI environment variable to true
  process.env.CI = '1'
  electronApp = await electron.launch({
    args: [appInfo.main],
    executablePath: appInfo.executable,
  })
})

test.afterAll(async () => {
  await electronApp.close()
})

let page: Page

test('renders the home page', async () => {
  page = await electronApp.firstWindow()
  const title = await page.title()
  expect(title).toBe('gato://home')
})