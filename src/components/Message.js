import { useSelector } from 'react-redux';
import store from '../store';
import { hideMessage } from '../util/message';
import './Message.css';

export default function Message() {
  const messageState = useSelector((state) => state.message);

  return (
    <div
      className={`message default-no-select default-pointer ${messageState.shown ? 'message--is-shown' : ''}`}
      onClick={() => store.dispatch(hideMessage())}
    >
      {messageState.text}
    </div>
  );
}
