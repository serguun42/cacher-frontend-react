import PropTypes from 'prop-types';
import Ripple from './Ripple';
import './Chip.css';

/**
 * @param {{ state: boolean, setState: import("react").SetStateAction<boolean>, label: string }} props
 */
export default function Chip({ state, setState, label }) {
  return (
    <div
      className={`chip ${state ? '' : 'chip--inactive'} default-pointer default-no-select`}
      onClick={() => setState(!state)}
    >
      {state && <i className="material-icons">close</i>}
      <div className="chip__label">{label}</div>
      <Ripple />
    </div>
  );
}

Chip.propTypes = {
  state: PropTypes.bool,
  setState: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

Chip.defaultProps = {
  state: false,
};
