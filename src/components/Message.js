import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { hideMessage } from '../store/message';
import store from '../store';
import dispatcher from '../util/dispatcher';
import './Message.css';

export default function Message() {
  const messageState = useSelector((state) => state.message);

  /**
   * @param {KeyboardEvent} e
   */
  const onKeyDown = (e) => {
    if (e.key === 'Escape' || e.code === 'Escape')
      dispatcher.call('hideMessageIfPossible', store.getState().message.lastId);
  };

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div
      className={`message default-no-select default-pointer ${messageState.shown ? 'message--is-shown' : ''}`}
      onClick={() => store.dispatch(hideMessage())}
    >
      {messageState.text}
    </div>
  );
}
