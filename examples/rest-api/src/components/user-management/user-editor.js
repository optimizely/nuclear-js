/**
 * @jsx React.DOM
 */
const React = require('react')
const Flux = require('../../flux')
const UserManagement = require('../../modules/user-management')

module.exports = React.createClass({
  mixins: [Flux.ReactMixin],

  getDataBindings() {
    return {
      values: UserManagement.getters.editUserFormValues,
      isDirty: UserManagement.getters.isEditUserFormDirty,
      dirtyFields: UserManagement.getters.editUserDirtyFields,
    }
  },

  updateField(fieldName, e) {
    UserManagement.actions.updateUserField(fieldName, e.target.value)
  },

  onCancel() {
    UserManagement.actions.cancelEdit()
  },

  onSubmit(e) {
    e.preventDefault()
    UserManagement.actions.submitEditForm()
  },

  render() {
    var values = this.state.values
    var user = this.props.user

    var dirtySpanStyle = { opacity: .5 }
    var nameDirty = this.state.dirtyFields.get('name')
      ? <span style={dirtySpanStyle}>dirty</span>
      : null

    var emailDirty = this.state.dirtyFields.get('email')
      ? <span style={dirtySpanStyle}>dirty</span>
      : null

    return (
      <form onSubmit={this.onSubmit}>
        <h1>Editing User:</h1>

        <dl className="form">
          <dt>
            <label>Name {nameDirty}</label>
          </dt>
          <dd>
            <input type="text" className="textfield"
              value={values.get('name')}
              onChange={this.updateField.bind(this, 'name')} />
          </dd>
        </dl>

        <dl className="form">
          <dt><label>Email {emailDirty}</label></dt>
          <dd>
            <input type="text" className="textfield"
              value={values.get('email')}
              onChange={this.updateField.bind(this, 'email')} />
          </dd>
        </dl>

        <div className="form-actions">
          <button type="submit"
            className="btn btn-primary"
            disabled={!this.state.isDirty}
          >
            Save changes
          </button>
          <button type="button" className="btn" onClick={this.onCancel}>Cancel</button>
        </div>
      </form>
    )
  }
})
