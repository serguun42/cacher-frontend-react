import './Loading.css';

export default function Loading() {
  return (
    <div
      className="loader default-no-select"
      onContextMenu={(e) => {
        e.preventDefault();
        return false;
      }}
    >
      <div className="loader__logo">
        <div className="loader__logo__waves">
          <div className="loader__logo__wave loader__logo__wave--1" />
          <div className="loader__logo__wave loader__logo__wave--2" />
          <div className="loader__logo__wave loader__logo__wave--3" />
          <div className="loader__logo__wave loader__logo__wave--4" />
        </div>

        <img
          className="loader__logo__image default-no-select"
          src={`${process.env.PUBLIC_URL}/img/${process.env.REACT_APP_SITE_CODE}/icons/round/192x192.png`}
          alt="Loading"
          onContextMenu={(e) => {
            e.preventDefault();
            return false;
          }}
        />
      </div>
    </div>
  );
}
