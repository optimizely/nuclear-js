import React from 'react'
import ItemFilterExample from './components/item-filter-example'
import hljs from 'highlight.js'


hljs.initHighlightingOnLoad();

React.render(
  <ItemFilterExample />,
  document.getElementById('item-filter-example')
)
