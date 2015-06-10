import React from 'react'

export default React.createClass({
  render() {
    var pageTitle = this.props.title || "NuclearJS"

    return (
      <html lang="en">
        <head>
          <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no"/>
          <title>{pageTitle}</title>
          <link href="output.css" type="text/css" rel="stylesheet" media="screen,projection"/>
        </head>
        <body>
          {this.props.children}
          <script src="app.js"></script>
        </body>
      </html>
    )
  }
})
