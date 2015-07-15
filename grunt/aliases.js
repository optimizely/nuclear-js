module.exports = {
  'test': [
    'karma:phantom',
  ],

  'sauce': [
    'karma:sauce_modern',
    'karma:sauce_ie',
    'karma:sauce_mobile',
  ],

  'ci': [
    'eslint',
    'clean:coverage',
    'karma:coverage',
    'coveralls',
    //'sauce', TODO: investigate why sauce connect isnt working
  ],
}
