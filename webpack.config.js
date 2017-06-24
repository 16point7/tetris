var path = require('path');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
var StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin');

module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'bin/'),
        filename: 'app.bundle.js'
    },
    module: {
        rules: [
            {
                test:/\.css$/,
                use: ExtractTextPlugin.extract({
                    use: 'css-loader'
                })
            },
            {
                test:/\.(png|jpg|svg|gif)$/,
                use: 'file-loader'
            }
        ]
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
        new ExtractTextPlugin('styles.css'),
        new StyleExtHtmlWebpackPlugin(),
        new ScriptExtHtmlWebpackPlugin({
            inline: 'app.bundle.js'
        })
    ]
}
