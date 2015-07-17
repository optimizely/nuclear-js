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

var React = require('react')
var Chat = require('../modules/chat')
var cx = require('react/lib/cx')
// var NuclearMixin = require('nuclear-js-react-addons/nuclearMixin')
var nuclearComponent = require('nuclear-js-react-addons/nuclearComponent')

var ReactPropTypes = React.PropTypes

var ThreadListItem = React.createClass({
  // mixins: [NuclearMixin], // mixin use

  propTypes: {
    thread: ReactPropTypes.object,
    currentThreadID: ReactPropTypes.string,
  },

  render: function() {
    var thread = this.props.thread
    var lastMessage = thread.get('messages').last()
    var dateString = (new Date(lastMessage.get('timestamp'))).toLocaleTimeString()
    return (
      <li
        className={cx({
          'thread-list-item': true,
          'active': thread.get('threadID') === this.props.currentThreadID,
        })}
        onClick={this._onClick}>
        <h5 className="thread-name">{thread.get('threadName')}</h5>
        <div className="thread-time">
          {dateString}
        </div>
        <div className="thread-last-message">
          {lastMessage.get('text')}
        </div>
      </li>
    )
  },

  _onClick: function() {
    var threadID = this.props.thread.get('threadID')
    if (this.props.currentThreadID !== threadID) {
      /**
       * If you use the mixin, dataBindings is state and reactor is in context,
       * if you use the HoC nuclearComponent, both are props
       */
      // Chat.actions.clickThread(this.context.reactor, threadID) // with mixin
      Chat.actions.clickThread(this.props.reactor, threadID) // with HoC
    }
  },
})

// HoC use with
module.exports = nuclearComponent(ThreadListItem/*, optionalDataBindingsObject */)
