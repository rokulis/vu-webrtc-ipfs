// Webpack uses this to work with directories
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const CompressionPlugin = require('compression-webpack-plugin');
const BrotliPlugin = require("brotli-webpack-plugin");

var ImageminPlugin = require('imagemin-webpack-plugin').default
const imageminMozjpeg = require('imagemin-mozjpeg');
// This is main configuration object.
// Here you write different options and tell Webpack what to do
module.exports = {

    // Path to your entry point. From this file Webpack will begin his work
    entry: './src/js/index.js',

    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true // set to true if you want JS source maps
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    // Path and filename of your result bundle.
    // Webpack will bundle all JavaScript into this file
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    resolve: {
        modules: ['node_modules', 'src'],
    },
    module: {

        rules: [
            {
                test: /\.js$/, // test is a regular expression for file extension which we are going to transform. In our case it's JavaScript files.
                exclude: /(node_modules)/, // is a regular expression that tells Webpack which path should be ignored when transforming modules. That means we won't transform imported vendor libraries from npm if we import them in the future.
                use: { // is a main rule's option. Here we set loader which is going to be applied to files that correspond to test regexp (JavaScript files in this case)
                    loader: 'babel-loader',
                    options: { //  can vary depending on loader. In this case we set default presets for Babel to consider which ES6 features it should transform and which not.
                        // It is separate topic on its own and you can dive into it if you are interested, but for now it's safe to keep it like this.
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                // Apply rule for .sass, .scss or .css files
                test: /\.(sa|sc|c)ss$/,

                // Set loaders to transform files.
                // Loaders are applying from right to left(!)
                // The first loader will be applied after others
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        // This loader resolves url() and @imports inside CSS
                        loader: "css-loader",
                    },
                    // {
                    //     // Then we apply postCSS fixes like autoprefixer and minifying
                    //     loader: "postcss-loader"
                    // },
                    {
                        // First we transform SASS to standard CSS
                        loader: "sass-loader",
                        options: {
                            implementation: require("sass")
                        }
                    }
                ]
            },
            {
                // Now we apply rule for images
                test: /\.(png|jpe?g|gif|svg)$/,
                use: [
                    {
                        // Using file-loader for these files
                        loader: "file-loader",

                        // In options we can set different things like format
                        // and directory to save
                        options: {
                            outputPath: 'assets/img',
                            // use: ["file-loader?name=[name].[hash].[ext]"]
                        }
                    },
                    // {
                    //     loader: "image-webpack-loader",
                    //     options: {
                    //         mozjpeg: {
                    //             progressive: true,
                    //             quality: 65
                    //         },
                    //         optipng: {
                    //             enabled: false,
                    //         },
                    //         pngquant: {
                    //             quality: [0.65, 0.90],
                    //             speed: 4
                    //         },
                    //         gifsicle: {
                    //             interlaced: false,
                    //         },
                    //         webp: {
                    //             quality: 75
                    //         },
                    //         svgo: {
                    //             removeViewBox: false
                    //         }
                    //     }
                    // }
                ]
            },
            {
                // Apply rule for fonts files
                test: /\.(woff|woff2|ttf|otf|eot)$/,
                use: [
                    {
                        // Using file-loader too
                        loader: "file-loader",
                        options: {
                            outputPath: 'assets/fonts'
                        }
                    }
                ]
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
            },
        ],
    },


    plugins: [
        new MiniCssExtractPlugin({
            filename: "bundle.css",

        }),

        // new BrotliPlugin({
        //     asset: "[path].br[query]",
        //     test: /\.(js|css|html|svg)$/,
        //     threshold: 10240,
        //     minRatio: 0.8
        // }),

        new CompressionPlugin({
            filename: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0.8
        }),

        new HtmlWebpackPlugin({ template: './src/index.html' }),
    ],

    // Default mode for Webpack is production.
    // Depending on mode Webpack will apply different things
    // on final bundle. For now we don't need production's JavaScript 
    // minifying and other thing so let's set mode to development

    devServer: {
        stats: {
            children: false, // Hide children information
            maxModules: 0 // Set the maximum number of modules to be shown
        },
        port: 3001
    },
    devtool: '#eval-source-map',
};