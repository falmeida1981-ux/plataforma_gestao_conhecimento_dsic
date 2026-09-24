import { defineConfig, devices } from "@playwright/test";

const PORTA = 3100;
const naCI = !!process.env.CI;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: naCI,
  retries: naCI ? 1 : 0,
  reporter: naCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORTA}`,
    locale: "pt-PT",
    timezoneId: "Europe/Lisbon",
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "telemovel", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // Na CI testa-se o build de produção (npm run build corre antes); localmente, o servidor de desenvolvimento.
    command: naCI ? `npx next start -p ${PORTA}` : `npx next dev -p ${PORTA}`,
    url: `http://localhost:${PORTA}/api/health`,
    reuseExistingServer: !naCI,
    timeout: 120_000,
  },
});
