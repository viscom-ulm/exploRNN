import * as React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import * as actions from '../../actions';
import styles from '../../styles/themedStyles';
import ProcessPanel from './panels/ProcessPanel';
import ControlPanel from './panels/ControlPanel';
import SliderPanel from './panels/SliderPanel';
import DescriptionPanel from './panels/DescriptionPanel';

/**
 * The current Component holding all the input elements to change the Network
 * for Training.
 */
class Input extends React.Component {
  /**
   * The render function for this react component
   *
   * @return {object} the rendered component
   */
  render() {
    return (
      <div id="valueDiv" className={this.props.classes.panelWrapper}
        align="center"
      >
        <Grid container
          spacing={3}
          justify='space-evenly'>
          {
            this.props.ui.detail ?
            <DescriptionPanel/>:
            <SliderPanel/>
          }
          {
            <ControlPanel/>
          }
          {
            <ProcessPanel/>
          }
        </Grid>
      </div>
    );
  }
}


// Controls state of the Application
Input.propTypes = {
  network: PropTypes.object.isRequired,
  training: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

/**
 * Map the states from redux to this property.
 *
 * @param {object} state - the global redux state.
 * @return {object} - the new props of this component.
 */
function mapStateToProps(state) {
  return {
    network: state.network,
    training: state.training,
    ui: state.ui,
  };
}

/**
 * Maps the actions to this property.
 *
 * @param {function} dispatch - the function that is used to call an action.
 * @return {object} - the actions that can be used in this component.
 */
function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(actions, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withStyles(styles)(Input)
);
