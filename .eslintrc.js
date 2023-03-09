module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:react/recommended', 'airbnb', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'react/react-in-jsx-scope': 0,
    'react/jsx-filename-extension': 0,
    'react/style-prop-object': 0,
    'import/prefer-default-export': 0,
    'no-unused-vars': 1,
    'import/no-extraneous-dependencies': 0,
    'no-use-before-define': 0,
  },
};
