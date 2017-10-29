import HtmlWebpackPlugin from 'html-webpack-plugin';
import { COMMON_CHUNK_NAME } from './util/constants';
import { DEVELOPMENT_IP, DEVELOPMENT_PORT } from './configs/server';

export const addEntryDevOptions = ({
                                       entry,
                                   }) => {
    entry.unshift(`webpack-dev-server/client?http://${DEVELOPMENT_IP}:${DEVELOPMENT_PORT}`);
    entry.unshift('webpack/hot/log-apply-result');

    // hot reload
    // entry.unshift('webpack/hot/dev-server');
    entry.unshift('webpack/hot/only-dev-server');

    entry.unshift('react-hot-loader/patch');
};

export const addHtmlWebpackPlugins = ({
                                          plugins,
                                          entryName,
                                          templatePath,
                                          fileName,
                                      }) => {
    if (entryName === COMMON_CHUNK_NAME) {
        return;
    }
    plugins.push(new HtmlWebpackPlugin({
        template: templatePath,
        filename: fileName,
        inject: 'body',
        chunks: [
            COMMON_CHUNK_NAME,
            entryName,
        ],
    }));
};
