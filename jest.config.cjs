/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'js'],

  globals: { 'ts-jest': { useESM: true } },

  collectCoverageFrom: [
    'src/core/**/*.{ts,tsx}',
    'src/middleware/authentication.ts'
  ],
  coverageThreshold: {
    global: { statements: 80, branches: 80, functions: 80, lines: 80 }
  }
};