var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: ['./src/main'],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'main.bundle.js'
    },
    resolve: {
        extensions: ['', '.js', '.ts', '.tsx']
    },
	module: {
        loaders: [{
            test: /\.tsx?$/,
			loaders: ['awesome-typescript-loader'],
			include: path.join(__dirname, 'src')
		}]
	},
    stats: {
        colors: true,
        warnings: false
    },
    devtool: 'source-map'
};
