'use strict'
const os = require('os');
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge').merge
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")


const webpackConfig = merge(baseWebpackConfig, { 
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  devtool: config.build.productionSourceMap ? 'hidden-source-map' : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'), 
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js'),
  },
  optimization: {
    splitChunks: {
      chunks: 'all', // Optimize all chunks
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test: module => /node_modules/.test(module.resource),
          priority: 10,
          chunks: 'initial'
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: chunk => ['oj', 'admin'].includes(chunk.name),
          priority: 5
        }
      }
    },
    runtimeChunk: {
      name: 'manifest'
    },
    concatenateModules: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.uglifyJsMinify,
        exclude: /\.min\.js$/,
        terserOptions: {
          sourceMap: true,
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin()
    ],
    moduleIds: 'deterministic',
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': config.build.env
    }),

    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      chunkFilename: utils.assetsPath('css/[id].[contenthash].css')
    }),

    // copy custom static assets
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../static'),
          to: config.build.assetsSubDirectory,
          globOptions: {
            ignore: ['.*']
          }
        }
      ]
    }),
    
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    // OJ index
    new HtmlWebpackPlugin({
      filename: config.build.ojIndex,
      template: config.build.ojTemplate,
      chunks: ['manifest', 'vendor', 'oj'],
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    }),
    
    // Admin index
    new HtmlWebpackPlugin({
      filename: config.build.adminIndex,
      template: config.build.adminTemplate,
      chunks: ['manifest', 'vendor', 'admin'],
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    }),
    
    // Add cache groups for faster builds
    new webpack.ids.HashedModuleIdsPlugin(),
  ],
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      filename: '[path][base].gz', // Updated property name
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
