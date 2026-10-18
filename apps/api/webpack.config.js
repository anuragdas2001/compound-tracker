const path = require('path');
const fs = require('fs');

class CopyPrismaPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('CopyPrismaPlugin', () => {
      try {
        const clientPath = require.resolve('@prisma/client');
        const dotPrisma = path.resolve(path.dirname(clientPath), '../../.prisma/client');
        if (fs.existsSync(dotPrisma)) {
          const files = fs.readdirSync(dotPrisma);
          for (const file of files) {
            if (file.endsWith('.node') || file.includes('query_engine')) {
              const src = path.join(dotPrisma, file);
              const destDist = path.join(compiler.outputPath, file);
              const destApi = path.join(__dirname, file);
              fs.copyFileSync(src, destDist);
              fs.copyFileSync(src, destApi);
              console.log(`[CopyPrismaPlugin] Copied ${file} to dist and apps/api`);
            }
          }
        }
      } catch (e) {
        console.warn('[CopyPrismaPlugin] Warning copying Prisma engines:', e.message);
      }
    });
  }
}

module.exports = (options) => {
  return {
    ...options,
    // Do NOT use webpack-node-externals — bundle everything
    externals: [],
    plugins: [
      ...(options.plugins || []),
      new CopyPrismaPlugin(),
    ],
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
