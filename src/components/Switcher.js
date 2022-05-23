import PropTypes from 'prop-types';
import { createRef, useState } from 'react';
import { SlideDown, SlideUp } from '../util/animations';
import Ripple from './Ripple';
import './Switcher.css';

/**
 * @typedef {Object} SwitcherProps
 * @property {{ title: string, key: any }[]} data
 * @property {(key: any) => void} onOptionSelect
 * @property {number} [preselectedIndex]
 * @property {string} [prefix]
 */
/**
 * @param {SwitcherProps} props
 */
export default function Switcher({ data, onOptionSelect, preselectedIndex, prefix }) {
  const [displaying, setDisplaying] = useState(data[preselectedIndex || 0]?.title);
  const [selected, setSelected] = useState(data[preselectedIndex || 0]?.key);

  /** @type {import("react").RefObject<HTMLElement>} */
  const dropdownRef = createRef();

  const expandDropdown = () => SlideDown(dropdownRef.current, 400, { display: 'block' });

  const closeDropdown = () => SlideUp(dropdownRef.current, 400);

  return (
    <div
      className="switcher default-no-select default-pointer"
      tabIndex={0}
      onFocus={expandDropdown}
      onBlur={closeDropdown}
    >
      <div className="switcher__displaying" onClick={expandDropdown}>
        <span>{`${prefix ? `${prefix} ` : ''}${displaying}`}</span>
        <div className="material-icons">expand_more</div>
        <Ripple />
      </div>
      <div className="switcher__dropdown" ref={dropdownRef}>
        {data.map(({ title, key }) => (
          <div
            className={`switcher__option ${key === selected ? 'switcher__option--selected' : ''}`}
            key={`switcher-option-${title}-${key}`}
            onClick={() => {
              onOptionSelect(key);
              setDisplaying(title);
              setSelected(key);
              closeDropdown();
            }}
          >
            {key === selected ? <i className="material-icons">done</i> : null}
            <span>{title}</span>
            <Ripple />
          </div>
        ))}
      </div>
    </div>
  );
}

Switcher.propTypes = {
  data: PropTypes.array.isRequired,
  onOptionSelect: PropTypes.func.isRequired,
  preselectedIndex: PropTypes.number,
  prefix: PropTypes.string,
};

Switcher.defaultProps = {
  preselectedIndex: 0,
  prefix: '',
};
