import React from 'react'
import ItemFilterExample from './components/item-filter-example'
import hljs from 'highlight.js'
import addScrollClass from './utils/scroll-class'

addScrollClass("scrolled")

hljs.initHighlightingOnLoad();

React.render(
  <ItemFilterExample />,
  document.getElementById('item-filter-example')
)
