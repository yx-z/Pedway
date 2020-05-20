// This is following https://mongoosejs.com/docs/jest.html
module.exports = {
  testEnvironment: './test/mongooseEnvironment.js',
  reporters: [
    'default',
    'jest-junit',
  ],
  preset: 'jest-puppeteer',
};
