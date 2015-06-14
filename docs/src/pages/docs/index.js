import React from 'react'
import Redirect from '../../layouts/redirect'
import { BASE_URI } from '../../globals'

export default React.createClass({
  render() {
    return <Redirect to={BASE_URI} />
  }
})
