try {
  /* eslint-disable no-console */
  if (!(window.console && console.log)) {
  /* eslint-enable no-console */
    console = {
      log: function() {},
      debug: function() {},
      info: function() {},
      warn: function() {},
      error: function() {},
    }
  }
} catch(e) {
  // ignored
}
