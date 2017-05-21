import React, { Component } from 'react'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import {FlatButton} from 'material-ui'
import SettingsIcon from 'react-material-icons/icons/action/settings'

export default class Settings extends Component {
  constructor (props) {
    super(props)
    console.log('PROPS', props)
    console.log(this.props.timeDiff)
    this.state = {
      modalOpen: false
    }
  }

  onModalClose () {
    this.setState({modalOpen: false})
  }

  openModal () {
    this.setState({modalOpen: true})
  }

  closeModal () {
    this.setState({modalOpen: false})
  }

  render () {
    return (
      <div>
        <SettingsIcon
          className='top-right icon-button'
          onClick={() => this.openModal()}
        />

        <Dialog
          title="Settings"
          actions={[
            <FlatButton onClick={() => this.props.resetSync()}>Re-Sync</FlatButton>,
            <FlatButton onClick={() => this.closeModal()}>Close</FlatButton>
            // <FlatButton onClick={() => this.props.reconnect()}>Reconnect</FlatButton>
          ]}
          modal={false}
          open={this.state.modalOpen}
          onRequestClose={() => this.onModalClose()}
        >
          <TextField
            style={{width: '100%'}}
            floatingLabelText="Time Server URL"
            value={this.props.timeServer}
            onChange={(event, value) => this.props.onSettingsChange({timeServer: value})}
          />
          <TextField
            style={{width: '100%'}}
            floatingLabelText="Control Server URL"
            value={this.props.controlServer}
            onChange={(event, value) => this.props.onSettingsChange({controlServer: value})}
          />
          <TextField
            style={{width: '100%'}}
            floatingLabelText="YouTube Audio Server URL"
            value={this.props.youtubeAudioServer}
            onChange={(event, value) => this.props.onSettingsChange({youtubeAudioServer: value})}
          />
          <TextField
            style={{width: '100%'}}
            floatingLabelText="Requests to Analyze"
            value={this.props.maxRequests}
            onChange={(event, value) => this.props.onSettingsChange({maxRequests: value})}
          />
          <TextField
            style={{width: '100%'}}
            floatingLabelText="Preload Time (ms)"
            value={this.props.preloadTime}
            onChange={(event, value) => this.props.onSettingsChange({preloadTime: value})}
          />
          <TextField
            style={{width: '100%'}}
            floatingLabelText="Time Diff (ms)"
            value={this.props.timeDiff}
            onChange={(event, value) => this.props.onSettingsChange({timeDiff: value})}
          />
        </Dialog>
      </div>
    )
  }
}
