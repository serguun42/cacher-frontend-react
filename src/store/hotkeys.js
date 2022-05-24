import { createSlice } from '@reduxjs/toolkit';

export const hotkeysSlice = createSlice({
  name: 'hotkeys',
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

export const { activateHotkeys, deactivateHotkeys } = hotkeysSlice.actions;

export const { reducer } = hotkeysSlice;
