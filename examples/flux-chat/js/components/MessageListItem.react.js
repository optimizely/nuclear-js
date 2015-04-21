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

var React = require('react');

var ReactPropTypes = React.PropTypes;

var MessageListItem = React.createClass({

  propTypes: {
    message: ReactPropTypes.object
  },

  render: function() {
    var message = this.props.message
    var dateString = (new Date(message.get('timestamp'))).toLocaleTimeString()

    return (
      <li className="message-list-item">
        <h5 className="message-author-name">{message.get('authorName')}</h5>
        <div className="message-time">
          {dateString}
        </div>
        <div className="message-text">{message.get('text')}</div>
      </li>
    );
  }

});

module.exports = MessageListItem;
