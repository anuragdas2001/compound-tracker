const path = require('path');

module.exports = (options) => {
  return {
    ...options,
    // Do NOT use webpack-node-externals — bundle everything
    externals: [],
    output: {
      ...options.output,
      path: path.resolve(__dirname, 'dist'),
      filename: 'main.js',
      libraryTarget: 'commonjs2',
    },
    resolve: {
      ...options.resolve,
      // Ensure workspace packages resolve correctly
      symlinks: true,
    },
  };
};
