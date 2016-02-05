try {
  if (!(window.console && console.log)) { // eslint-disable-line
    console = {
      log: function() {},
      debug: function() {},
      info: function() {},
      warn: function() {},
      error: function() {},
    }
  }
} catch(e) {} // eslint-disable-line
