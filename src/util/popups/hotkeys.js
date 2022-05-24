import Hotkeys from '../../components/Hotkeys';
import store from '../../store';
import dispatcher from '../dispatcher';

export default function PopupAboutHotkeys() {
  /** @type {import("../../components/Popup").PopupPayload} */
  const popupPayload = {
    title: 'Горячие клавиши',
    messages: <Hotkeys />,
    isBig: true,
    hideable: true,
  };

  dispatcher.call('popup', popupPayload);
}

window.addEventListener('keydown', (e) => {
  if ((e.key === '?' || e.key === ',') && e.code === 'Slash' && e.shiftKey) {
    if (store.getState().hotkeys.hotkeysActive) PopupAboutHotkeys(e);
  }
});
