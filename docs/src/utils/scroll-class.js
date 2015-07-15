export default function(scrollClass) {
  const el = document.body
  window.addEventListener('scroll', updateClass.bind(null, el, scrollClass))
  updateClass(el, scrollClass)
}

function updateClass(el, className) {
  const scrollPos = el.scrollTop
  if (scrollPos === 0) {
    if (hasClass(el, className)) {
      console.log('removing scroll class')
      el.className = el.className.replace(className, '');
    }
  } else {
    if (!hasClass(el, className)) {
      console.log('adding scroll')
      el.className += ' ' + className;
    }
  }
}

function hasClass(el, className) {
  var classRE = new RegExp(className)
  return classRE.test(el.className)
}
