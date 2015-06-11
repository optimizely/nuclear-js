import React from 'react'

export default React.createClass({
  render() {
    const redirectTo = this.props.to || '/'
    const redirectJS = {
      __html: "window.location = '" + redirectTo + "'",
    }
    return (
      <html lang="en">
        <head>
          <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no"/>
        </head>
        <body>
          <script dangerouslySetInnerHTML={redirectJS}></script>
        </body>
      </html>
    )
  }
})
