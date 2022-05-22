import PropTypes from 'prop-types';
import { useState, useLayoutEffect } from 'react';
import './Ripple.css';

const DURATION = 800;

const useDebouncedRippleCleanUp = (rippleCount, duration, cleanUpFunction) => {
  useLayoutEffect(() => {
    let bounce = null;
    if (rippleCount > 0) {
      clearTimeout(bounce);

      bounce = setTimeout(() => {
        cleanUpFunction();
        clearTimeout(bounce);
      }, duration * 4);
    }

    return () => clearTimeout(bounce);
  }, [rippleCount, duration, cleanUpFunction]);
};

/**
 * @param {{ inheritTextColor: boolean }} props
 */
export default function Ripple({ inheritTextColor }) {
  const [rippleArray, setRippleArray] = useState([]);

  useDebouncedRippleCleanUp(rippleArray.length, DURATION, () => setRippleArray([]));

  /**
   * @param {MouseEvent & TouchEvent} e
   */
  const addRipple = (e) => {
    const containerRect = e.currentTarget.getBoundingClientRect();
    const size = containerRect.width > containerRect.height ? containerRect.width : containerRect.height;
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - containerRect.x - size / 2;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - containerRect.y - size / 2;
    const rippleToSet = { x, y, size };

    setRippleArray([...rippleArray, rippleToSet]);
  };

  const supportTouch = 'ontouchstart' in window;

  return (
    <div
      className={`ripple-container ${inheritTextColor ? 'ripple-container--inherit' : ''}`}
      onMouseDown={supportTouch ? undefined : addRipple}
      onTouchStart={addRipple}
    >
      {rippleArray.length > 0 &&
        rippleArray.map((ripple, rippleIndex) => {
          return (
            <div
              className="ripple-container__ripple"
              // eslint-disable-next-line react/no-array-index-key
              key={`span${rippleIndex}`}
              style={{
                top: ripple.y,
                left: ripple.x,
                width: ripple.size,
                height: ripple.size,
              }}
            />
          );
        })}
    </div>
  );
}

Ripple.propTypes = {
  inheritTextColor: PropTypes.bool,
};

Ripple.defaultProps = {
  inheritTextColor: false,
};
