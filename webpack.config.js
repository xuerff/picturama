const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const FixDefaultImportPlugin = require('webpack-fix-default-import-plugin')
const nodeExternals = require('webpack-node-externals')

const production = process.env.NODE_ENV === 'production'
const useDevServer = !process.env.NODE_ENV

console.log('Building in ' + (production ? 'production' : 'dev') + ' mode (' + (useDevServer ? 'for' : 'no') + ' dev server)')


const commonPlugins = [
    new FixDefaultImportPlugin()
]

const commonConfig = {
    mode: production ? 'production' : 'development',
    node: {
        __dirname: false,
        __filename: false,
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '',
        filename: '[name].js',
    },
    resolve: {
        modules: [
            // directories where to look for modules
            path.resolve(__dirname, 'src'),
            'node_modules'
        ],
        extensions: [ '.mjs', '.ts', '.tsx', '.js', '.jsx', '.json' ]
    },
    // Use sourcemaps only in dev build
    // Must be 'source-map' or 'inline-source-map'
    // (see: https://webpack.js.org/loaders/less-loader/#sourcemaps)
    devtool: production ? false : 'source-map',
    externals: (() => {
        const modules = [ 'fs', 'net', 'os', 'readline', 'path' ]
        let customExternals = {}
        for (const module of modules) {
            customExternals[module] = `(function() { var mod = require('${module}'); if (!mod.default) mod.default = mod; return mod; })()`
        }
        const externals = [
            nodeExternals({
                whitelist: [ /^font-awesome(\/|$)/ ]
            }),
            customExternals
        ]
        return externals
    })(),
    plugins: commonPlugins
}

const typescriptRule = {
    test: new RegExp('(^' + escapeRegExp(path.resolve(__dirname, 'src')) + '\/.*\.jsx?|\.tsx?)$'),
    loader: 'awesome-typescript-loader'
}


module.exports = [
    {
        ...commonConfig,
        target: 'electron-main',
        entry: {
            background: './src/background/entry.ts'
        },
        module: {
            rules: [
                typescriptRule
            ]
        },
    },
    {
        ...commonConfig,
        target: 'electron-renderer',
        entry: () => {
            const devServerEntry = useDevServer ? [ 'webpack/hot/only-dev-server' ] : []
            entry = {
                app: devServerEntry.concat([
                    './src/app/entry.tsx'
                ]),
                'test-ui': './src/test-ui/entry.tsx'
            }
            if (!production) {
                //entry['test-ui'] = devServerEntry.concat([
                //    './src/test-ui/entry.tsx'
                //])
            }
            return entry
        },

        plugins: [
            ...commonPlugins,

            new CopyPlugin({
                patterns: [ { from: 'src/static' } ]
            }),

            // Extract CSS into separate file
            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: 'assets/[id].css'
            })
        ],
        module: {
            rules: [
                typescriptRule,
                {
                    test: /\.(less|css)$/,
                    // We don't extract our CSS in dev mode in order to make hot-reload work
                    use: useDevServer ?
                        [
                            { loader: 'style-loader', options: {
                                sourceMap: true,
                                singleton: true
                                    // Ensures CSS is applied before JS is executed.
                                    // See: https://stackoverflow.com/questions/39400038/how-to-ensure-that-hot-css-loads-before-js-in-webpack-dev-server
                            } },
                            { loader: 'css-loader', options: { sourceMap: true, importLoaders: 2 } },
                            { loader: 'less-loader', options: { sourceMap: true, noIeCompat: true } }
                        ] :
                        [
                            MiniCssExtractPlugin.loader,
                            'css-loader',
                            'less-loader'
                        ]
                },
                {
                    test: /\.(png|gif|jpe?g|ico|svg|ttf|woff2?|eot|)(\?.*)?$/i,
                    // If the asset is smaller than 10kb inline it,
                    // else, fallback to the file-loader and reference it
                    loader: 'url-loader',
                    options: { name: 'assets/[contenthash].[ext]', limit: 10000 }
                }
            ]
        },

        devServer: {
            host: '0.0.0.0', // Make dev-server accessible from local network
            port: 3030,
            hot: true
        }

    }
]


function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
