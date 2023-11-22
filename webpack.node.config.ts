import fs from 'fs';
import path from 'path';

const nodeModules = {};

fs.readdirSync(path.resolve(__dirname, 'node_modules'))
  .filter((x) => !['.bin'].includes(x))
  .forEach((mod) => {
    nodeModules[mod] = `commonjs ${mod}`;
  });

module.exports = {
  mode: 'production',
  entry: './server/index.ts',
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'server.js',
  },
  externals: nodeModules,
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-typescript'],
        },
      },
    ],
  },
  resolve: { extensions: ['.*', '.ts'] },
  target: 'node',
};
