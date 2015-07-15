import React from 'react'
import Redirect from '../../layouts/redirect'
import { BASE_URL } from '../../globals'

export default React.createClass({
  render() {
    return <Redirect to={BASE_URL} />
  }
})
