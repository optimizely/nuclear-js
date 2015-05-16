/**
 * @jsx React.DOM
 */
var React = require('react')
var Flux = require('../../flux')
var User = require('../../modules/user')
const UserManagement = require('../../modules/user-management')

var UserListComponent = require('./user-list')
var UserEditorComponent = require('./user-editor')

module.exports = React.createClass({
  mixins: [Flux.ReactMixin],

  getDataBindings() {
    return {
      users: User.getters.userList,
      editingUser: UserManagement.getters.currentlyEditingUser,
    }
  },

  componentWillMount() {
    User.actions.fetchAll();
  },

  _clickUser(user) {
    UserManagement.actions.editUser(user)
  },

  render() {
    var userEditor = null
    if (this.state.editingUser) {
      userEditor = <UserEditorComponent user={this.state.editingUser} />
    }

    const userItems = this.state.users.map(user => {
      var classes = 'menu-item'
      if (user === this.state.editingUser) {
        classes += ' selected'
      }
      return (
        <a className={classes} onClick={this._clickUser.bind(this, user)} >
          {user.get('name')}
        </a>
      )
    })

    return <div className="container">
      <div className="columns">
        <div className="one-third column">
          <nav className="menu">
            {userItems}
          </nav>
        </div>
        <div className="two-thirds column">
          {userEditor}
        </div>
      </div>
    </div>
  },
})
