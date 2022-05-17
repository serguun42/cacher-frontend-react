import { createSlice } from '@reduxjs/toolkit';
import Dispatcher from './dispatcher';

/** @typedef {"light" | "dark" | "schedule" | "system"} ThemeEnum */
/**
 * @typedef ThemeObject
 * @property {ThemeEnum} raw
 * @property {boolean} isDark
 * @property {string} icon
 * @property {string} name
 */

/** @type {ThemeEnum[]} */
const AVAILABLE_THEMES = ['system', 'light', 'dark', 'schedule', 'system'];

/** @returns {ThemeEnum} */
const GetRawFromStorage = () => localStorage.getItem('theme-raw');

/**
 * @param {ThemeEnum} [themeRawParam]
 */
const CheckDarkTheme = (themeRawParam = '') => {
  const themeRaw = themeRawParam || GetRawFromStorage();
  if (themeRaw === 'dark') return true;

  if (themeRaw === 'schedule')
    return (
      new Date().getHours() > 19 ||
      (new Date().getHours() === 19 && new Date().getMinutes() >= 30) ||
      new Date().getHours() < 7 ||
      (new Date().getHours() === 7 && new Date().getMinutes() <= 29)
    );

  if (themeRaw === 'light') return false;

  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
};

/** @type {{ [prop in ThemeEnum]: string }} */
const THEME_ICONS = {
  light: 'light_mode',
  dark: 'dark_mode',
  schedule: 'auto_awesome',
  system: 'settings_suggest',
};

/**
 * @param {ThemeEnum} themeRawParam
 * @returns {string}
 */
const GetThemeIcon = (themeRawParam) => THEME_ICONS[themeRawParam];

/** @type {{ [prop in ThemeEnum]: string }} */
const THEME_NAMES = {
  light: 'Светлая тема',
  dark: 'Тёмная тема',
  schedule: 'По расписанию (тёмная после 19:30)',
  system: 'Системная тема',
};

/**
 * @param {ThemeEnum} themeRawParam
 * @returns {string}
 */
const GetThemeName = (themeRawParam) => THEME_NAMES[themeRawParam];

/**
 * @param {ThemeEnum} [themeRawParam]
 * @returns {ThemeObject}
 */
export const GetCompleteTheme = (themeRawParam = '') => {
  const themeRaw = themeRawParam || GetRawFromStorage() || 'system';

  return {
    raw: themeRaw,
    isDark: CheckDarkTheme(themeRaw),
    icon: GetThemeIcon(themeRaw),
    name: GetThemeName(themeRaw),
  };
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState: GetCompleteTheme(),

  reducers: {
    nextTheme: (state) => {
      const nextTheme = GetCompleteTheme(AVAILABLE_THEMES[AVAILABLE_THEMES.indexOf(state.raw) + 1 || 0]);

      state.raw = nextTheme.raw;
      state.isDark = nextTheme.isDark;
      state.icon = nextTheme.icon;
      state.name = nextTheme.name;

      Dispatcher.call('themeChanged', state);
      localStorage.setItem('theme-raw', state.raw);
    },

    /**
     * @param {{ payload: ThemeEnum }} action
     */
    changeTheme: (state, action) => {
      const applyingTheme = GetCompleteTheme(
        AVAILABLE_THEMES.includes(action.payload) ? action.payload : AVAILABLE_THEMES[0]
      );
      state.raw = applyingTheme.raw;
      state.isDark = applyingTheme.isDark;
      state.icon = applyingTheme.icon;
      state.name = applyingTheme.name;

      Dispatcher.call('themeChanged', state);
      localStorage.setItem('theme-raw', state.raw);
    },

    checkSystemOnMediaChange: (state) => {
      if (state.raw !== 'system') return;

      const checkingTheme = GetCompleteTheme('system');

      state.raw = checkingTheme.raw;
      state.isDark = checkingTheme.isDark;
      state.icon = checkingTheme.icon;
      state.name = checkingTheme.name;

      Dispatcher.call('themeChanged', state);
      localStorage.setItem('theme-raw', state.raw);
    },
  },
});

export const { nextTheme, changeTheme, checkSystemOnMediaChange } = themeSlice.actions;

export const { reducer } = themeSlice;
