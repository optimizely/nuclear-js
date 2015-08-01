import React from 'react'
import ItemFilterExample from './components/item-filter-example'
import addScrollClass from './utils/scroll-class'

addScrollClass("scrolled")

render(ItemFilterExample, 'item-filter-example')

updateSideBar()

function render(component, id) {
  var el = document.getElementById(id)
  if (el) {
    React.render(React.createElement(component), el)
  }
}

function updateSideBar() {
  var sideBarElements = document.getElementsByClassName('sidebar-links--item')
  for (var i in sideBarElements) {
    if (sideBarElements[i].firstChild) {
      if (window.location.href === sideBarElements[i].firstChild.href) {
        sideBarElements[i].className = 'sidebar-links--item-active'
      } else {
        sideBarElements[i].className = 'sidebar-links--item'
      }
    }
  }
}
