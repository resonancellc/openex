import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import * as R from 'ramda'
import {T} from '../../../../../components/I18n'
import {i18nRegister} from '../../../../../utils/Messages'
import * as Constants from '../../../../../constants/ComponentTypes'
import {Popover} from '../../../../../components/Popover'
import {Menu} from '../../../../../components/Menu'
import {Dialog} from '../../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../../components/Button'
import {Icon} from '../../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from '../../../../../components/menu/MenuItem'
import Theme from '../../../../../components/Theme'
import {updateUser} from '../../../../../actions/User'
import {updateSubaudience} from '../../../../../actions/Subaudience'
import UserForm from './UserForm'

const style = {
  position: 'absolute',
  top: '7px',
  right: 0,
}

i18nRegister({
  fr: {
    'Do you want to remove the user from this sub-audience?': 'Souhaitez-vous supprimer l\'utilisateur de cette sous-audience ?',
    'Update the user': 'Modifier l\'utilisateur',
    'Update the profile': 'Modifier le profil de l\'utilisateur',
    'Profile': 'Profil'
  }
})

class UserPopover extends Component {
  constructor(props) {
    super(props)
    this.state = {openDelete: false, openEdit: false, openPopover: false}
  }

  handlePopoverOpen(event) {
    event.stopPropagation()
    this.setState({openPopover: true, anchorEl: event.currentTarget})
  }

  handlePopoverClose() {
    this.setState({openPopover: false})
  }

  handleOpenEdit() {
    this.setState({openEdit: true})
    this.handlePopoverClose()
  }

  handleCloseEdit() {
    this.setState({openEdit: false})
  }

  onSubmitEdit(data) {
    return this.props.updateUser(this.props.user.user_id, data)
  }

  submitFormEdit() {
    this.refs.userForm.submit()
  }

  handleOpenDelete() {
    this.setState({openDelete: true})
    this.handlePopoverClose()
  }

  handleCloseDelete() {
    this.setState({openDelete: false})
  }

  submitDelete() {
    const user_ids = R.pipe(
      R.values,
      R.filter(a => a.user_id !== this.props.user.user_id),
      R.map(u => u.user_id)
    )(this.props.subaudience.subaudience_users)
    this.props.updateSubaudience(this.props.exerciseId, this.props.audience.audience_id, this.props.subaudience.subaudience_id, {subaudience_users: user_ids})
    this.handleCloseDelete()
  }

  switchColor(disabled) {
    if (disabled) {
      return Theme.palette.disabledColor
    } else {
      return Theme.palette.textColor
    }
  }

  render() {
    const editActions = [
      <FlatButton key="cancel" label="Cancel" primary={true} onClick={this.handleCloseEdit.bind(this)}/>,
      <FlatButton key="update" label="Update" primary={true} onClick={this.submitFormEdit.bind(this)}/>,
    ]
    const deleteActions = [
      <FlatButton key="cancel" label="Cancel" primary={true} onClick={this.handleCloseDelete.bind(this)}/>,
      <FlatButton key="delete" label="Delete" primary={true} onClick={this.submitDelete.bind(this)}/>,
    ]
    
    var organizationPath = [R.prop('user_organization', this.props.user), 'organization_name']
    let organization_name = R.pathOr('-', organizationPath, this.props.organizations)
    let initialValues = R.pipe(
      R.assoc('user_organization', organization_name),
      R.pick(['user_firstname', 'user_lastname', 'user_email', 'user_email2', 'user_organization', 'user_phone', 'user_phone2', 'user_phone3', 'user_pgp_key'])
    )(this.props.user)

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT} color={this.switchColor(!this.props.audience.audience_enabled || !this.props.subaudience.subaudience_enabled)}/>
        </IconButton>
        <Popover open={this.state.openPopover} anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Edit" onClick={this.handleOpenEdit.bind(this)}/>
            <MenuItemButton label="Delete" onClick={this.handleOpenDelete.bind(this)}/>
          </Menu>
        </Popover>
        <Dialog title="Confirmation" modal={false} open={this.state.openDelete}
                onRequestClose={this.handleCloseDelete.bind(this)}
                actions={deleteActions}>
          <T>Do you want to remove the user from this sub-audience?</T>
        </Dialog>
        <Dialog title="Update the user" modal={false} open={this.state.openEdit}
                autoScrollBodyContent={true}
                onRequestClose={this.handleCloseEdit.bind(this)}
                actions={editActions}>
          <UserForm ref="userForm" initialValues={initialValues}
                    organizations={this.props.organizations}
                    onSubmit={this.onSubmitEdit.bind(this)}
                    onSubmitSuccess={this.handleCloseEdit.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

const select = (state) => {
  return {
    organizations: state.referential.entities.organizations
  }
}

UserPopover.propTypes = {
  exerciseId: PropTypes.string,
  user: PropTypes.object,
  updateUser: PropTypes.func,
  updateSubaudience: PropTypes.func,
  audience: PropTypes.object,
  subaudience: PropTypes.object,
  organizations: PropTypes.object,
  children: PropTypes.node
}

export default connect(select, {updateUser, updateSubaudience})(UserPopover)
