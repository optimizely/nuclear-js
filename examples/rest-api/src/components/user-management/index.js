/**
 * @jsx React.DOM
 */
var React = require('react')
var Flux = require('../../flux')
var User = require('../../modules/user')
var UserManagement = require('../../modules/user-management')

var UserEditorComponent = require('./user-editor')

module.exports = React.createClass({
  mixins: [Flux.ReactMixin],

  getDataBindings() {
    return {
      users: User.getters.userList,
      editingUser: UserManagement.getters.currentlyEditingUser,
    }
  },

  getInitialState() {
    return {
      fetchingUsers: false,
    }
  },

  componentWillMount() {
    this.setState({ fetchingUsers: true })
    User.actions.fetchAll().then(() => {
      this.setState({ fetchingUsers: false })
    });
  },

  _clickUser(user) {
    UserManagement.actions.editUser(user)
  },

  render() {
    let userEditor = null
    if (this.state.editingUser) {
      userEditor = <UserEditorComponent user={this.state.editingUser} />
    }

    let userItems = this.state.users.map(user => {
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

    let userList = this.state.fetchingUsers
      ? null
      : <nav className="menu">{userItems}</nav>

    let title = this.state.fetchingUsers
      ? <h3>Loading...</h3>
      : <h3>Select a user to edit</h3>

    return <div className="container">
      <div className="columns">
        <div className="one-third column">
          {title}
          {userList}
        </div>
        <div className="two-thirds column">
          {userEditor}
        </div>
      </div>
    </div>
  },
})
