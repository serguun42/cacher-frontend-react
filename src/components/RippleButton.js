import React from 'react';
import { arrayOf, element, string } from 'prop-types';
import './RippleButton.css';

export default function RippleButton(props) {
  const { children, className } = props;
  const [coords, setCoords] = React.useState({ x: -1, y: -1 });
  const [isRippling, setIsRippling] = React.useState(false);

  React.useEffect(() => {
    if (coords.x !== -1 && coords.y !== -1) {
      setIsRippling(true);
      setTimeout(() => setIsRippling(false), 300);
    } else setIsRippling(false);
  }, [coords]);

  React.useEffect(() => {
    if (!isRippling) setCoords({ x: -1, y: -1 });
  }, [isRippling]);

  return (
    <button
      type="button"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      className={`ripple-button default-no-select default-pointer ${className || ''}`}
      onTouchStart={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCoords({ x: e.touches[0].clientX - rect.left - 10, y: e.touches[0].clientY - rect.top - 10 });
      }}
      onMouseDown={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCoords({ x: e.clientX - rect.left - 10, y: e.clientY - rect.top - 10 });
      }}
    >
      {isRippling ? (
        <span
          className="ripple-button__ripple"
          style={{
            left: coords.x,
            top: coords.y,
          }}
        />
      ) : null}
      <span className="ripple-button__content">{children}</span>
    </button>
  );
}

RippleButton.propTypes = {
  children: arrayOf(element),
  className: string,
};

RippleButton.defaultProps = {
  children: [],
  className: '',
};
