module.exports = {
  'test': [
    'karma:chrome', 
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
    //  'coveralls', //doesn't seem to be a thing anymore.
    //'sauce', TODO: investigate why sauce connect isnt working
  ],
}
