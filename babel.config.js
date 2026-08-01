module.exports = function (api) {
  // For tests, use a minimal babel configuration
  if (api.env('test')) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
    };
  }

  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
