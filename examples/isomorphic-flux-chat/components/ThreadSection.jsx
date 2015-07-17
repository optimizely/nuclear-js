/**
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * This file is es6 over 9000 to show the nuclearComponent over the mixin
 */

import React, { Component } from 'react'
import { getters } from '../modules/chat'
import nuclearComponent from 'nuclear-js-react-addons/nuclearComponent'
import ThreadListItem from './ThreadListItem.jsx'

@nuclearComponent({
  threads: getters.threads,
  unreadCount: getters.unreadCount,
  currentThreadID: getters.currentThreadID,
})
class ThreadSection extends Component {
  render() {
    const {
      threads,
      unreadCount,
      currentThreadID,
    } = this.props;

    const threadListItems = threads.map(thread => {
      return (
        <ThreadListItem
          key={thread.get('threadID')}
          thread={thread}
          currentThreadID={currentThreadID}
        />
      )
    })

    const unread =
      unreadCount === 0 ?
      null :
      <span>Unread threads: {unreadCount}</span>

    return (
      <div className="thread-section">
        <div className="thread-count">
          {unread}
        </div>
        <ul className="thread-list">
          {threadListItems}
          </ul>
      </div>
    )
  }
}

export default ThreadSection
