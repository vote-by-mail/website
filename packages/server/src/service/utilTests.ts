export const testEach = process.env.CI ? test.skip.each : test.each
