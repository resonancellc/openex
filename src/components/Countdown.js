import React, {Component, PropTypes} from 'react'
import {ONE_SECOND, dateFromNow, now, parse} from '../utils/Time'
import Rx from 'rxjs/Rx'
import {injectIntl} from 'react-intl'
import {T} from '../components/I18n'
import countdown from 'countdown'
import * as Constants from '../constants/ComponentTypes'
import {i18nRegister} from '../utils/Messages'

i18nRegister({
  fr: {
    ' ms| s| m| h| d| w| m| y| d| c| m': ' ms| s| m| h| j| s| m| a| d| s| m',
    'now': 'maintenant',
    'in progress': 'en cours'
  }
})

const styles = {
  [ Constants.COUNTDOWN_TITLE ]: {
    float: 'left',
    margin: '0px 0px 0px 0px'
  }
}

class Countdown extends Component {
  translate(text) {
    return this.props.intl.formatMessage({id: text})
  }

  constructor(props) {
    super(props);
    this.state = {startDate: new Date()}
    var options = this.translate(' ms| s| m| h| d| w| m| y| d| c| m')
    countdown.setLabels(options, options, ', ', ', ', this.translate('now'));
  }

  componentDidMount() {
    const initialStream = Rx.Observable.of(1);
    const intervalStream = Rx.Observable.interval(ONE_SECOND)
    this.subscription = initialStream
      .merge(intervalStream)
      .do(() => this.setState({startDate: new Date()}))
      .subscribe()
  }

  componentWillUnmount() {
    this.subscription.unsubscribe()
  }

  render() {
    if (now().isAfter(parse(this.props.targetDate))) {
      return <span style={styles[this.props.type]}>(<T>in progress</T>)</span>
    } else {
      return <span style={styles[this.props.type]}>({dateFromNow(this.props.targetDate)})</span>
    }
  }
}

Countdown.propTypes = {
  targetDate: PropTypes.string,
  intl: PropTypes.object,
  type: PropTypes.string
}

export default injectIntl(Countdown)