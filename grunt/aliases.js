module.exports = {
  'test': [
    'karma:phantom'
  ],

  'sauce': [
    'karma:sauce_modern',
    'karma:sauce_ie',
    'karma:sauce_mobile',
  ],

  'ci': [
    'clean:coverage',
    'karma:coverage',
    'coveralls',
    'sauce',
  ],
};
