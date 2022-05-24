import PropTypes from 'prop-types';
import './Checkbox.css';
import Ripple from './Ripple';

/**
 * @param {{ state: boolean, setState: import("react").SetStateAction<boolean>, label: string }} props
 */
export default function Checkbox({ state, setState, label }) {
  return (
    <div className="checkbox default-pointer default-no-select" onClick={() => setState(!state)}>
      <div className="checkbox__square">
        {state ? (
          <i className="material-icons">check_box</i>
        ) : (
          <i className="material-icons">check_box_outline_blank</i>
        )}
        <Ripple />
      </div>
      <div className="checkbox__label">{label}</div>
    </div>
  );
}

Checkbox.propTypes = {
  state: PropTypes.bool,
  setState: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

Checkbox.defaultProps = {
  state: false,
};
