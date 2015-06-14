import React from 'react'
import ItemFilterExample from './components/item-filter-example'
import hljs from 'highlight.js'
import addScrollClass from './utils/scroll-class'

addScrollClass("scrolled")

hljs.initHighlightingOnLoad();

render(ItemFilterExample, 'item-filter-example')

function render(component, id) {
  var el = document.getElementById(id)
  if (el) {
    React.render(React.createElement(ItemFilterExample), el)
  }
}
