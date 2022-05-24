import { createSlice } from '@reduxjs/toolkit';
import dispatcher from '../util/dispatcher';

/**
 * @param {string} color
 */
const ChangeThemeColor = (color = '') => {
  const settingThemeColor = (color || getComputedStyle(document.body).getPropertyValue('--header'))?.trim();
  const themeColorMetaTags = Array.from(document.head.querySelectorAll(`[data-meta-name="theme-color"]`));
  themeColorMetaTags.forEach((metaTag) => metaTag.setAttribute('content', settingThemeColor));
};

window.addEventListener('load', () => ChangeThemeColor());

export const messageSlice = createSlice({
  name: 'message',
  initialState: {
    text: '',
    shown: false,
    lastId: '',
  },

  reducers: {
    /**
     * @param {{ payload: string }} action
     */
    showMessage: (state, action) => {
      const currentMessageId = `${action.payload}_${Date.now()}`;
      state.lastId = currentMessageId;
      state.text = action.payload;
      state.shown = true;

      ChangeThemeColor(getComputedStyle(document.body).getPropertyValue('--message-background')?.trim());

      setTimeout(() => dispatcher.call('hideMessageIfPossible', currentMessageId), 4000);
    },

    hideMessage: (state) => {
      state.lastId = `hiding_message_${Date.now()}`;
      state.shown = false;
      ChangeThemeColor();
    },
  },
});

export const { showMessage, hideMessage } = messageSlice.actions;

export const { reducer } = messageSlice;
