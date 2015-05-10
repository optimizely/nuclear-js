module.exports = {
  'ci': [
    'clean:coverage',
    'karma:coverage',
    'coveralls',
  ],
  'coverage': [
    'clean:coverage',
    'karma:coverage',
    'coveralls',
  ],
};
