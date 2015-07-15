import React from 'react'
import { BASE_URL } from '../globals'

const PRISM_PATH = BASE_URL + 'assets/js/prism.js'
const CSS_PATH = BASE_URL + 'assets/css/output.css'
const JS_PATH = BASE_URL + 'app.js'

const GA_SCRIPT = `(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-64060472-1', 'auto');
ga('send', 'pageview');`

export default React.createClass({
  render() {
    let pageTitle = "NuclearJS"
    if (this.props.title) {
      pageTitle += " | " + this.props.title
    }

    return (
      <html lang="en">
        <head>
          <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no"/>
          <title>{pageTitle}</title>
          <link href={CSS_PATH} type="text/css" rel="stylesheet" media="screen,projection"/>
          <script src="//cdn.optimizely.com/js/3006700484.js"></script>
          <script dangerouslySetInnerHTML={{__html: GA_SCRIPT}}></script>
        </head>
        <body>
          {this.props.children}
          <script src={PRISM_PATH}></script>
          <script src={JS_PATH}></script>
        </body>
      </html>
    )
  }
})
