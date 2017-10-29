
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import { formatArgs } from '../util/args';
import { getCwd, getAbsolutePath } from '../util/path';
import getWebpackConfig from '../util/getWebpackConfig';
import devServer from '../configs/startDevServer';

export const dev = (args) => {
    const { entry } = args;
    const webpackConfig = getWebpackConfig(args);
    return devServer({
        webpackConfig,
        entry,
    });
};

const formats = {
    base: (input) => {
        return getAbsolutePath(getCwd(), input);
    },
};

export const command = 'dev';
export const describe = 'Compile and start dev server';
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
    output: {
        describe: 'output folder',
        type: 'string',
    },
    tpl: {
        describe: 'template folder',
        type: 'string',
    },
    entry: {
        describe: 'default index',
        type: 'string',
    },
    symbol: {
        describe: 'symbol',
        type: 'boolean',
        default: true,
    },
};

/* tslint:disable no-console */
export const handler = async(args) => {
    const {
        symbol,
        ...resetArgs,
    } = args;
    const argv = await formatArgs(formats, resetArgs);
    try {
        await dev(argv)();
    } catch (err) {
        if (symbol) {
            console.log(logSymbols.error, `${describe} ${chalk.red(err)}`);
        } else {
            console.error(err);
        }
        process.exit(1);
    }
};
