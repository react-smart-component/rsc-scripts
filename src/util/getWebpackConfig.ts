
import createCommonConfig from '../configs/createCommonConfig';
import createWebpackConfig from '../configs/createWebpackConfig';

export default ({ base, src, exampleDirectory, output, tpl }) => {
    let basePath = base;
    let sourcePath = src;
    let examplePath = exampleDirectory;
    let outputPath = output;
    let templatePath = tpl;
    let webpackConfig: any = createCommonConfig();
    ({
        webpackConfig,
    } = createWebpackConfig({
        webpackConfig,
        basePath,
        sourcePath,
        outputPath,
        templatePath,
        examplePath,
    }));

    return webpackConfig;
};
