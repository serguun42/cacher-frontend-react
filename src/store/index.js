import { configureStore } from '@reduxjs/toolkit';
import { reducer as themeReducer } from './theme';
import { showMessage, hideMessage, reducer as messageReducer } from './message';
import { activateHotkeys, deactivateHotkeys, reducer as hotkeysReducer } from './hotkeys';
import dispatcher from '../util/dispatcher';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    message: messageReducer,
    hotkeys: hotkeysReducer,
  },
});

dispatcher.link(
  'themeChanged',
  /** @param {import("./theme").ThemeObject} appliedTheme */ (appliedTheme) => {
    setTimeout(() => store.dispatch(showMessage(appliedTheme.name)));
  }
);

dispatcher.link('message', (messageText) => store.dispatch(showMessage(messageText)));
dispatcher.link('hideMessageIfPossible', (currentMessageId) => {
  if (store.getState().message.lastId === currentMessageId) store.dispatch(hideMessage());
});

dispatcher.link('activateHotkeys', () => store.dispatch(activateHotkeys()));
dispatcher.link('deactivateHotkeys', () => store.dispatch(deactivateHotkeys()));

export default store;
