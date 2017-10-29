
import open from 'react-dev-utils/openBrowser';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { DEVELOPMENT_IP, DEVELOPMENT_PORT } from './server';

/* tslint:disable no-console */
export default ({
                    webpackConfig,
                    entry = 'index',
                }) => {
    const devServerOptions = {
        hot: true,
        historyApiFallback: true,
        stats: {
            assets: false,
            colors: true,
            cached: false,
            children: false,
            chunks: false,
            chunkModules: false,
            chunkOrigins: false,
            errors: true,
            errorDetails: true,
            hash: false,
            modules: false,
            publicPath: false,
            reasons: false,
            source: false,
            timing: true,
            version: false,
            warnings: true,
        },
        // stats: 'verbose',
    };
    let compiler: any = null;
    let server: any = null;
    try {
        compiler = webpack(webpackConfig);
        server = new WebpackDevServer(compiler, devServerOptions);
    } catch (ex) {
        console.log(ex);
    }

    let opened = false;

    const openBrowser = () => {
        const address: any = server.listeningApp.address();
        const url = `http://${address.address}:${address.port}`;
        console.log(`   server started: ${url}`);
        open(`${url}/${entry}.html`);
    };

    compiler.plugin('done', () => {
        if (!opened) {
            opened = true;
            openBrowser();
        }
    });

    const startServer: any = new Promise((resolve, reject) => {
        server.listen(DEVELOPMENT_PORT, DEVELOPMENT_IP, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    return async() => {
        await startServer;

        const stdIn = process.stdin;
        stdIn.setEncoding('utf8');
        stdIn.on('data', openBrowser);
    };
};
