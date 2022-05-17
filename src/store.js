import { configureStore } from '@reduxjs/toolkit';
import { reducer as themeReducer } from './util/theme';

export default configureStore({
  reducer: {
    theme: themeReducer,
  },
});
