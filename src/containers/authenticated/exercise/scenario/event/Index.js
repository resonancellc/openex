import React, {Component, PropTypes} from 'react'
import R from 'ramda'
import moment from 'moment';
import {connect} from 'react-redux'
import {Toolbar, ToolbarTitle} from '../../../../../components/Toolbar'
import {List} from '../../../../../components/List'
import {MainListItem} from '../../../../../components/list/ListItem';
import {fetchAudiences} from '../../../../../actions/Audience'
import {fetchEvents} from '../../../../../actions/Event'
import {fetchIncidentTypes, fetchIncidents} from '../../../../../actions/Incident'
import {fetchInjectTypes, fetchInjects} from '../../../../../actions/Inject'
import * as Constants from '../../../../../constants/ComponentTypes';
import IncidentNav from './IncidentNav'
import EventPopover from './EventPopover'
import IncidentPopover from './IncidentPopover'
import CreateInject from './CreateInject'
import InjectPopover from './InjectPopover'

const styles = {
  'container': {
    paddingRight: '300px',
  },
  'title': {
    float: 'left',
    fontSize: '20px',
    fontWeight: 600
  },
  'empty': {
    marginTop: 40,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center'
  },
  'number': {
    float: 'right',
    color: '#9E9E9E',
    fontSize: '12px',
  },
  'inject_title': {
    float: 'left',
    width: '40%',
    padding: '5px 0 0 0'
  },
  'inject_date': {
    float: 'left',
    width: '20%',
    padding: '5px 0 0 0'
  },
  'inject_type': {
    float: 'left',
    width: '20%',
    padding: '5px 0 0 0'
  }
}

class Index extends Component {
  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId)
    this.props.fetchEvents(this.props.exerciseId)
    this.props.fetchIncidentTypes()
    this.props.fetchIncidents(this.props.exerciseId)
    this.props.fetchInjectTypes()
    this.props.fetchInjects(this.props.exerciseId, this.props.eventId)
  }

  render() {
    let {exerciseId, eventId, event, incident, incidents} = this.props
    let event_title = R.propOr('-', 'event_title', event)
    if (event && incident) {
      return <div style={styles.container}>
        <IncidentNav selectedIncident={incident.incident_id} exerciseId={exerciseId} eventId={eventId}
                     incidents={incidents} incident_types={this.props.incident_types}/>
        <div>
          <div style={styles.title}>{incident.incident_title}</div>
          <IncidentPopover exerciseId={exerciseId} eventId={eventId} incident={incident}
                           incident_types={this.props.incident_types}/>
          <div style={styles.number}>{incident.incident_injects.length} injects</div>
          <div className="clearfix"></div>

          {incident.incident_injects.length === 0 ?
            <div style={styles.empty}>This incident is empty.</div> : ""
          }

          <List>
            {incident.incident_injects.map(data => {
              //Setup variables
              let inject = R.propOr({}, data.inject_id, this.props.injects)
              let injectId = R.propOr(data.inject_id, 'inject_id', inject)
              let inject_title = R.propOr('-', 'inject_title', inject)
              let inject_date = R.prop('inject_date', inject)
              let inject_type = R.propOr('-', 'inject_type', inject)
              let inject_audiences = R.propOr([], 'inject_audiences', inject)
              //Return the dom
              return <MainListItem
                key={injectId}
                rightIconButton={
                  <InjectPopover
                    exerciseId={exerciseId}
                    eventId={eventId}
                    incidentId={incident.incident_id}
                    inject={inject}
                    injectAudiencesIds={inject_audiences.map(a => a.audience_id)}
                    audiences={this.props.audiences}
                    inject_types={this.props.inject_types}
                  />
                }
                primaryText={
                  <div>
                    <div style={styles.inject_title}>{inject_title}</div>
                    <div style={styles.inject_date}>{moment(inject_date).format('MMM D, YYYY HH:mm:ss')}</div>
                    <div style={styles.inject_type}>{inject_type}</div>
                    <div className="clearfix"></div>
                  </div>
                }
              />
            })}
          </List>
          <CreateInject exerciseId={exerciseId} eventId={eventId} incidentId={incident.incident_id}
                        inject_types={this.props.inject_types} audiences={this.props.audiences}/>
          <Toolbar type={Constants.TOOLBAR_TYPE_EVENT}>
            <ToolbarTitle type={Constants.TOOLBAR_TYPE_EVENT} text={event_title}/>
            <EventPopover exerciseId={exerciseId} eventId={eventId} event={event}/>
          </Toolbar>
        </div>
      </div>
    } else if (event) {
      return <div style={styles.container}>
        <IncidentNav exerciseId={exerciseId} eventId={eventId} incidents={incidents}/>
        <div style={styles.empty}>This event is empty.</div>
        <Toolbar type={Constants.TOOLBAR_TYPE_EVENT}>
          <ToolbarTitle type={Constants.TOOLBAR_TYPE_EVENT} text={event_title}/>
          <EventPopover exerciseId={exerciseId} eventId={eventId} event={event}/>
        </Toolbar>
      </div>
    } else {
      return <div style={styles.container}>
        <IncidentNav exerciseId={exerciseId} eventId={eventId} incidents={incidents}/>
        <div style={styles.empty}>No event loaded.</div>
        <Toolbar type={Constants.TOOLBAR_TYPE_EVENT}>
          <ToolbarTitle type={Constants.TOOLBAR_TYPE_EVENT} text={event_title}/>
        </Toolbar>
      </div>
    }
  }
}

Index.propTypes = {
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  eventId: PropTypes.string,
  event: PropTypes.object,
  incident_types: PropTypes.object,
  incident: PropTypes.object,
  incidents: PropTypes.array,
  inject_types: PropTypes.object,
  injects: PropTypes.object,
  fetchAudiences: PropTypes.func,
  fetchEvents: PropTypes.func,
  fetchIncidentTypes: PropTypes.func,
  fetchIncidents: PropTypes.func,
  fetchInjectTypes: PropTypes.func,
  fetchInjects: PropTypes.func,
}

const filterAudiences = (audiences, exerciseId) => {
  let audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name))
  )
  return audiencesFilterAndSorting(audiences)
}

const filterIncidents = (incidents, eventId) => {
  let incidentsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.incident_event.event_id === eventId),
    R.sort((a, b) => a.incident_title.localeCompare(b.incident_title))
  )
  return incidentsFilterAndSorting(incidents)
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let eventId = ownProps.params.eventId
  let audiences = filterAudiences(state.referential.entities.audiences, exerciseId)
  let event = R.prop(eventId, state.referential.entities.events)
  let incidents = filterIncidents(state.referential.entities.incidents, eventId)
  //region get default incident
  let stateCurrentIncident = R.path(['exercise', exerciseId, 'event', eventId, 'current_incident'], state.screen)
  let incidentId = stateCurrentIncident === undefined && incidents.length > 0 ? R.head(incidents).incident_id : stateCurrentIncident //Force a default incident if needed
  let incident = incidentId ? R.find(a => a.incident_id === incidentId)(incidents) : undefined
  //endregion

  return {
    exerciseId,
    eventId,
    event,
    incident,
    incidents,
    audiences,
    injects: state.referential.entities.injects,
    incident_types: state.referential.entities.incident_types,
    inject_types: state.referential.entities.inject_types
  }
}

export default connect(select, {
  fetchAudiences,
  fetchEvents,
  fetchIncidentTypes,
  fetchIncidents,
  fetchInjectTypes,
  fetchInjects
})(Index);