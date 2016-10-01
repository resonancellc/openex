import React, {PropTypes} from 'react';
import * as Constants from '../constants/ComponentTypes'
import LocalMovies from 'material-ui/svg-icons/maps/local-movies'
import HardwareComputer from 'material-ui/svg-icons/hardware/computer'
import SocialPerson from 'material-ui/svg-icons/social/person'
import SocialGroup from 'material-ui/svg-icons/social/group'
import ContentAdd from 'material-ui/svg-icons/content/add'
import ContentCopy from 'material-ui/svg-icons/content/content-copy'
import ContentMail from 'material-ui/svg-icons/content/mail'
import ActionDelete from 'material-ui/svg-icons/action/delete'
import ActionSettings from 'material-ui/svg-icons/action/settings'
import ActionSchedule from 'material-ui/svg-icons/action/schedule'

const iconStyle = {
  [ Constants.ICON_TYPE_NAVBAR ]: {
    margin: 0,
    padding: 0,
    left: 19,
    top: 8
  }
}

export const Icon = (props) => {
  const mergeStyle = Object.assign( {}, props.style, iconStyle[props.type])
  switch (props.name) {
    case Constants.ICON_NAME_LOCAL_MOVIES:
      return (<LocalMovies style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_HARDWARE_COMPUTER:
      return (<HardwareComputer style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_SOCIAL_PERSON:
      return (<SocialPerson style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_SOCIAL_GROUP:
      return (<SocialGroup style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_CONTENT_ADD:
      return (<ContentAdd style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_CONTENT_COPY:
      return (<ContentCopy style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_CONTENT_MAIL:
      return (<ContentMail style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_ACTION_DELETE:
      return (<ActionDelete style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_ACTION_SETTINGS:
      return (<ActionSettings style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_ACTION_SCHEDULE:
      return (<ActionSchedule style={mergeStyle} color={props.color} />)
    default:
      return (<HardwareComputer style={mergeStyle} color={props.color} />)
  }
}

Icon.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string,
  style: PropTypes.object,
  color: PropTypes.string
}