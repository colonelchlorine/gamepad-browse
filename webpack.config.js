const path = require('path');
let CopyWebpackPlugin = require('copy-webpack-plugin');
let webpack = require("webpack");

module.exports = {
	entry: {
		background: './src/background.ts',
		gamepad: './src/gamepad.ts'
	},
	resolve: { extensions: [ '.ts', '.js' ]  },
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  },
	plugins: [
		new CopyWebpackPlugin([
			{
				from: './manifest.json'
			},
			{
				from: './*.png'
			}
		]),
		new webpack.WatchIgnorePlugin([
			/\.js$/,
			/\.d\.ts$/
		])
	]
};