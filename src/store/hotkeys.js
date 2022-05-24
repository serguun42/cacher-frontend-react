import { createSlice } from '@reduxjs/toolkit';

export const keyboardSlice = createSlice({
  name: 'keyboard',
  initialState: {
    hotkeysActive: true,
  },

  reducers: {
    activateHotkeys: (state) => {
      state.hotkeysActive = true;
    },

    deactivateHotkeys: (state) => {
      state.hotkeysActive = false;
    },
  },
});

export const { activateHotkeys, deactivateHotkeys } = keyboardSlice.actions;

export const { reducer } = keyboardSlice;
