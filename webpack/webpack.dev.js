const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require('dotenv-webpack');
const { InjectManifest } = require('workbox-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "../public"),
  },
  devServer: {
    static: path.resolve(__dirname, "../public"),
    hot: true,
    port: process.env.PORT || 7878,
    open: true,
    client: {
      overlay: false,
    },
    proxy: [
      {
        context: ['/v1'],
        target: 'https://story-api.dicoding.dev',
        changeOrigin: true,
        secure: false,
      }
    ],
  },  
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
    }),
    new Dotenv(),
    new InjectManifest({
      swSrc: "./src/webpush-sw.js",
      swDest: "webpush-sw.js",
    }),
    new CopyPlugin({
      patterns: [{ from: 'public/offline.html', to: '' }],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
