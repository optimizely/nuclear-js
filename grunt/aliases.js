module.exports = {
  'test': [
    'karma:chrome', 
    'karma:firefox'
  ],


  'ci': [
    'eslint',
    'clean:coverage',
    'karma:coverage',
    //  'coveralls', //doesn't seem to be a thing anymore.
  ],
}
