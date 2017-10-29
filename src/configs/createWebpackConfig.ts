
import glob from 'glob';
import fse from 'fs-extra';
import path from 'path';
import numeral from 'numeral';
import logUpdate from 'log-update';
import webpack from 'webpack';
import NODE_ENV, { DEVELOPMENT } from '../util/nodeEnv';
import { addEntryDevOptions, addHtmlWebpackPlugins } from '../addEntry';

import {
    basePath as base,
    exampleSourcePath,
    exampleBuildPath,
    sourcePath as src,
    templatePath as tpl,
} from './path';

export default ({
                    webpackConfig,
                    basePath = base,
                    sourcePath = src,
                    examplePath = exampleSourcePath,
                    outputPath = exampleBuildPath,
                    templatePath = tpl,
                }) => {
    const newSourcePath = path.join(basePath, sourcePath);
    const newExamplePath = path.join(basePath, examplePath);
    const newOutputPath = path.join(basePath, outputPath);
    const newTemplatePath = path.join(basePath, templatePath);

    const newWebpackConfig = { ...webpackConfig };
    newWebpackConfig.output.path = newOutputPath;
    newWebpackConfig.resolve = {
        modules: [
            'node_modules',
        ],
        extensions: ['.web.js', '.jsx', '.js', '.json'],
    };

    newWebpackConfig.resolve.extensions.unshift('.tsx', '.ts');

    newWebpackConfig.module.rules.push({
        enforce: 'pre',
        test: /\.tsx?$/,
        include: [
            newSourcePath,
            newExamplePath,
        ],
        use: [
            'tslint-loader',
        ],
    });

    let entryNameList = Object.keys(newWebpackConfig.entry);
    if (entryNameList.length === 0) {
        const ext = 'ts';
        newWebpackConfig.entry.index = [path.join(newExamplePath, `./index.${ext}`)];
        const examplePagesPath = path.join(newExamplePath, './pages');    // no index with in pages
        if (fse.existsSync(examplePagesPath)) {
            const filePathList = glob.sync(path.join(examplePagesPath, `*.${ext}`));
            filePathList.forEach((filePath) => {
                const fileName = path.parse(filePath).name;
                newWebpackConfig.entry[fileName] = [filePath];
            });
            entryNameList = Object.keys(newWebpackConfig.entry);
        }
    }

    entryNameList.forEach((entryName) => {
        addHtmlWebpackPlugins({
            plugins: newWebpackConfig.plugins,
            entryName,
            templatePath: newTemplatePath,
            fileName: path.join(newOutputPath, `${entryName}.html`),
        });
    });

    switch (NODE_ENV) {
        case DEVELOPMENT:
            entryNameList.forEach((entryName) => {
                const entry = newWebpackConfig.entry[entryName];
                addEntryDevOptions({
                    entry,
                });
            });

            newWebpackConfig.devtool = 'eval';
            newWebpackConfig.output.publicPath = '/';

            newWebpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
            newWebpackConfig.plugins.push(new webpack.ProgressPlugin((percentage, msg) => {
                logUpdate('     progress:', numeral(percentage).format('00.00%'), msg);
            }));
            break;
        default:
            newWebpackConfig.devtool = 'source-map';
            newWebpackConfig.output.publicPath = './';
            break;
    }

    return {
        webpackConfig: newWebpackConfig,
        basePath,
        sourcePath: newSourcePath,
        outputPath: newOutputPath,
        templatePath: newTemplatePath,
        examplePath: newExamplePath,
    };
};
