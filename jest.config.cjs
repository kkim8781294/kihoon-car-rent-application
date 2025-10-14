/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  // ✅ 커버리지 80% 맞추기 쉽게 core만 포함 (컨트롤러는 제외)
  collectCoverageFrom: ["src/core/**/*.{ts,tsx}"],
  coverageThreshold: {
    global: { statements: 80, branches: 70, functions: 80, lines: 80 }
  }
};
