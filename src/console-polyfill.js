try {
  if (!(window.console && console.log)) {
    console = {
      log: function(){},
      debug: function(){},
      info: function(){},
      warn: function(){},
      error: function(){}
    };
  }
} catch(e) {}
