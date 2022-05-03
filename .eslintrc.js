/* eslint-env node */
module.exports = {
	env: {
		browser: true,
		es2020: true
	},
	extends: [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:prettier/recommended"
	],
	parserOptions: {
		ecmaFeatures: {
			jsx: true
		},
		ecmaVersion: 11,
		sourceType: "module"
	},
	plugins: ["react", "prettier"],
	rules: {
		// suppress errors for missing 'import React' in files
		"react/react-in-jsx-scope": "off",
		// allow jsx syntax in js files (for next.js project)
		// should add ".ts" if typescript project
		"react/jsx-filename-extension": [1, { extensions: [".js", ".jsx"] }]
	},
	settings: {
		react: {
			version: "detect"
		}
	}
};
