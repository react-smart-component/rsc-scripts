import ora from 'ora';
import chalk from 'chalk';
import webpack from 'webpack';
import { formatArgs } from '../util/args';
import { getCwd, getAbsolutePath } from '../util/path';
import getWebpackConfig from '../util/getWebpackConfig';

export const describe = 'Compile project';

let spinner: any = null;

export const build = (args) => {
    return new Promise((resolve, reject) => {
        const webpackConfig = getWebpackConfig(args);
        webpack(webpackConfig, (err, stats) => {
            if (err || stats.hasErrors()) {
                reject(err || stats.compilation.errors);
            } else {
                const {
                    startTime,
                    endTime,
                } = stats;
                const buildTime = endTime - startTime;
                resolve(buildTime);
            }
        });
    });
};

const formats = {
    base: (input) => {
        return getAbsolutePath(getCwd(), input);
    },
};

export const command = 'build';
export const builder = {
    base: {
        describe: 'project base folder',
        type: 'string',
        default: getCwd(),
    },
    src: {
        describe: 'source folder',
        type: 'string',
    },
    exampleDirectory: {
        describe: 'example folder',
        type: 'string',
    },
    buildDirectory: {
        describe: 'build folder',
        type: 'string',
    },
    output: {
        describe: 'output folder',
        type: 'string',
    },
    tpl: {
        describe: 'template folder',
        type: 'string',
    },
    symbol: {
        describe: 'symbol',
        type: 'boolean',
        default: true,
    },
};

export const handler = async(args: any) => {
    const {
        symbol,
        ...resetArgs,
    } = args;
    if (symbol) {
        spinner = ora(describe).start();
    }
    const argv = await formatArgs(formats, resetArgs);
    try {
        const buildTime = await build(argv);
        spinner.succeed(`${describe} Time: ${(chalk as any).bold(buildTime)}ms`);
    } catch (err) {
        console.error(err);
        if (symbol) {
            spinner.fail(describe);
        }
        process.exit(1);
    }
};
