import { configureStore } from '@reduxjs/toolkit';
import { reducer as themeReducer } from './util/theme';
import { hideMessage, reducer as messageReducer, showMessage } from './util/message';
import dispatcher from './util/dispatcher';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    message: messageReducer,
  },
});

dispatcher.link('hideMessageIfPossible', (currentMessageId) => {
  if (store.getState().message.lastId === currentMessageId) store.dispatch(hideMessage());
});

dispatcher.link(
  'themeChanged',
  /** @param {import("./util/theme").ThemeObject} appliedTheme */ (appliedTheme) => {
    setTimeout(() => store.dispatch(showMessage(appliedTheme.name)));
  }
);

export default store;
