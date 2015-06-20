import React from 'react'
import ItemFilterExample from './components/item-filter-example'
import addScrollClass from './utils/scroll-class'
import './prism'

Prism.highlightAll()

addScrollClass("scrolled")

render(ItemFilterExample, 'item-filter-example')

function render(component, id) {
  var el = document.getElementById(id)
  if (el) {
    React.render(React.createElement(ItemFilterExample), el)
  }
}
