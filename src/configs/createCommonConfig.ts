
import webpack from 'webpack';
import { COMMON_CHUNK_NAME } from '../util/constants';
import NODE_ENV, { DEVELOPMENT } from '../util/nodeEnv';

const jsRule = {
    test: /\.js$/,
    exclude: /node_modules/,
    use: [
        'babel-loader?cacheDirectory',
    ],
};

const tsRule = {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: ['babel-loader?cacheDirectory', 'awesome-typescript-loader'],
};

const cssRule = {
    test: /\.css$/,
    use: [
        'style-loader',
        {
            loader: 'css-loader',
            options: {
                minimize: true,
            },
        },
    ],
};

const fileRule = {
    test: /\.(png|jpg|gif)$/,
    use: [
        {
            loader: 'url-loader',
            options: {
                limit: 8192,
                name: 'images/[name].[ext]',
            },
        },
    ],
};

const lessRule = {
    test: /\.less$/,
    use: [
        'style-loader',
        {
            loader: 'css-loader',
            options: {
                minimize: true,
            },
        },
        'less-loader',
    ],
};

const createModuleRules = () => {
    if (NODE_ENV === DEVELOPMENT) {
        // support react-hot-loader@3, @see https://github.com/gaearon/react-hot-loader/tree/next-docs
        jsRule.use.unshift('react-hot-loader/webpack');
        tsRule.use.unshift('react-hot-loader/webpack');
    }

    let moduleRules = [
        jsRule,
        tsRule,
        cssRule,
        fileRule,
        lessRule,
    ];

    return moduleRules;
};

export default () => {
    const moduleRules = createModuleRules();

    const webpackConfig = {
        entry: {},
        output: {
            filename: 'js/[name].js',
        },
        module: {
            rules: moduleRules,
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify(NODE_ENV),
                },
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: COMMON_CHUNK_NAME,
                filename: 'js/[name].js',
                minChunks: 2,
            }),
        ],
        watchOptions: {
            ignored: [
                /node_modules/,
            ],
        },
    };

    return webpackConfig;
};
