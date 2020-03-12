module.exports = {
  verbose: false,
  transform: {
    '^.+\\.(js|ts|tsx)$': 'ts-jest',
  },
  moduleDirectories: ['node_modules', 'src'],
  roots: ['<rootDir>/src'],
  testRegex: '(\\.|/)(test)\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  globals: { 'ts-jest': { isolatedModules: true } },
  setupFiles: ['<rootDir>/test/setup.ts'],
};
