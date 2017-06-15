var path = require('path');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, './bin/'),
        filename: 'app.bundle.js'
    },
    plugins: [
	    new UglifyJSPlugin({
            comments: false
        }),
        new HtmlWebpackPlugin({
            template: './templates/index.html',
            inject: 'body',
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                minifyCSS: true
            }
        }),
        new ScriptExtHtmlWebpackPlugin({
            inline: 'app.bundle'
        })
    ]
}
