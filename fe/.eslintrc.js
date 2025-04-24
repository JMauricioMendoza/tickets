module.exports = {
    env: {
      browser: true,
      es2021: true,
    },
    extends: [
      'airbnb',
      'plugin:react/recommended',
      'plugin:prettier/recommended', // 💡 Esto conecta ESLint con Prettier
    ],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: ['react', 'prettier'],
    rules: {
      'prettier/prettier': 'error', // marca como error si no sigue formato prettier
      'react/react-in-jsx-scope': 'off', // si usas React 17+
      'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
      'import/prefer-default-export': 'off',
    },
  };
  