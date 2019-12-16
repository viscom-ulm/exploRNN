import * as React from 'react';
import {withStyles} from '@material-ui/core/styles';
import styles from '../../../styles/themedStyles';
import IconButton from '@material-ui/core/IconButton';
import PropTypes from 'prop-types';

/**
 * Generating function for the individual styled buttons
 *
 * @param {object} props the current redux state properties
 * @return {object} rendered styled button
 */
function StyledButtonRaw(props) {
  const {classes, properties, icon, action, disabled} = props;
  return (
    <IconButton disabled={disabled} variant="outlined"
      className={
        properties.ui.detail ? classes.button_cell : classes.button_net
      }
      onClick={action}>
      {icon}
    </IconButton>
  );
}

StyledButtonRaw.propTypes = {
  properties: PropTypes.object.isRequired,
  icon: PropTypes.object.isRequired,
  action: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
};

// const StyledSelect = withStyles(styles)(StyledSelectRaw);
export default withStyles(styles)(StyledButtonRaw);

