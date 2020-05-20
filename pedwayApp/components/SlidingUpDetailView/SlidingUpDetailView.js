import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import styles from './styles';
import SlidingUpPanel from 'rn-sliding-up-panel';
import Icon from 'react-native-vector-icons/MaterialIcons';


/**
 * renders a view Component that displays pedway info and user action when
 * mapMarker is clicked
 * Allow user to view the name and coordinate of the spot, display a button for user to navigate to
 * if this marker is a pedway entrance, we also need to show the open/close status and also display a feedback button
 * if this marker is a pedway entrance, a navigation buttonis also displayed. If navigation is false this button
 * will be start navigation button. Vice versa this button will be end navigation button.
 */

export default class SlidingUpDetailView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      entrance: null,
      navigateFunctor: null,
      navigate: false,
      isEntrance: true,
    };
    this.updateState = this.updateState.bind(this);
    this.openView = this.openView.bind(this);
    this.closeView = this.closeView.bind(this);
    this.navigateButtonOnPress = this.navigateButtonOnPress.bind(this);
    this.setNavigate = this.setNavigate.bind(this);
    this.feedbackButtonOnPress = this.feedbackButtonOnPress.bind(this);
    this.setIsOpen = this.setIsOpen.bind(this);
  }

  /**
   * set the open/close status of this sliding up view
   * @param status
   */
  setIsOpen(status) {
    this.setState({
      open: status,
    });
    if (status) {
      this.openView();
    } else {
      this.closeView();
    }
  }

  /**
   * update what entrance/attraction shown in this view from the object we got from the inputProps
   * @param inputProps
   */
  updateState(inputProps) {
    if (inputProps.entrance !== undefined && inputProps.entrance !== null) {
      this.setState({
        entrance: inputProps.entrance,
        isEntrance: inputProps.isEntrance,
      });
    }
  }

  openView() {
    this.detailView.show();
  }

  closeView() {
    this.detailView.hide();
  }

  componentDidMount() {
    this.updateState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateState(nextProps);
  }

  /**
   * communicate with app component when start/cancel navigation button is pressed
   */
  navigateButtonOnPress() {
    this.props.startNavigate(this.state.entrance, !this.state.navigate);
    this.setState({
      navigate: !this.state.navigate,
    });
  }

  /**
   * onPress listener for the feedback button
   */
  feedbackButtonOnPress() {
    // remove Entrance # string
    let entranceIndexString = this.state.entrance.getName().slice(10);
    try {
      let entranceIndex = parseInt(entranceIndexString);
      this.props.displayFeedbackWindow(entranceIndex);
    } catch {
    }
  }

  /**
   * set this.state.navigation
   * if state === false, also close the sliding up view
   * @param state
   */
  setNavigate(state) {
    this.setState({
      navigate: state,
      open: state,

    });
    if (!state) {
      this.closeView();
    }
  }

  render() {
    if (this.state.entrance !== undefined && this.state.entrance !== null) {
      return (
        <SlidingUpPanel
          draggableRange={{top: 150, bottom: 0}}
          showBackdrop={false}
          ref={(thisView) => {
            this.detailView = thisView;
          }}
        >
          <View style={styles.aboveFlexContainer}>
            <Text
              style={styles.entranceLabel}
              numberOfLines={1}
            >
              {this.state.entrance.getName()}
            </Text>
            <View style={styles.routeButtonContainer}>
              <TouchableOpacity
                style={styles.routeBackgroundContainer}
                onPress={() => {
                  this.navigateButtonOnPress();
                }}
              >
                <Icon
                  style={styles.routeButton}
                  name={this.state.navigate?'rotate-left':'directions-walk'}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.backgroundView}>
            <View style={styles.belowFlexContainer}>
              <View style={styles.belowFlex}>
                {!this.state.isEntrance?
                null:
                <StatusLabel
                  text={this.state.entrance.getStatus()}/>
                }
                <Text style={styles.coordinateText}>
                  {this.state.entrance.getCoordinate().getLatitude() + ', '
                  + this.state.entrance.getCoordinate().getLongitude()}
                </Text>
                {
                  this.state.isEntrance?
                    <View style={styles.routeButtonContainer}>
                      <TouchableOpacity
                        style={styles.feedbackBackgroundContainer}
                        onPress={() => {
                          this.feedbackButtonOnPress();
                        }}
                      >
                        <Icon
                          style={styles.feedbackButton}
                          name={'error-outline'}
                        />
                      </TouchableOpacity>
                    </View>:
                    null
                }
              </View>
            </View>
          </View>
        </SlidingUpPanel>
      );
    } else {
      return (
        <SlidingUpPanel
          draggableRange={{top: 150, bottom: 0}}
          showBackdrop={false}
          ref={(thisView) => {
            this.detailView = thisView;
          }}/>
      );
    }
  }
}


/**
 * separate component for the status label displaying the current status of the pedway entrance
 * if the status of the pedway is not requested yet, we need to render a blank rounded rectangle for placeholder
 */
class StatusLabel extends Component {
  render() {
    if (this.props.text === 'open') {
      return (
        <View style={[styles.statusLabelContainer, styles.statusLabelGreen]}>
          <Text style={styles.statusLabelText}>
            Open
          </Text>
        </View>
      );
    } else if (this.props.text === 'closed') {
      return (
        <View style={[styles.statusLabelContainer, styles.statusLabelRed]}>
          <Text style={styles.statusLabelText}>
            Closed
          </Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.statusLabelContainer, styles.statusLabelGrey]}>
          <Text style={styles.statusLabelText}>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </Text>
        </View>
      );
    }
  }
}
