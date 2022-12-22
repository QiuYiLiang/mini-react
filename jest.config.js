module.exports = {
  testEnvironment: "jsdom",
  preset: "ts-jest",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          target: "esnext",
          sourceMap: true,
        },
      },
    ],
  },
  globals: {},
  coverageDirectory: "coverage",
  coverageReporters: ["html", "lcov", "text"],
  watchPathIgnorePatterns: ["/node_modules/", "/dist/", "/.git/"],
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  moduleNameMapper: {
    __CORE__: "<rootDir>/packages/__CORE__/src",
  },
  rootDir: __dirname,
  testMatch: ["<rootDir>/packages/**/__tests__/**/*spec.[jt]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/"],
};
