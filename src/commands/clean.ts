
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import path from 'path';
import fse from 'fs-extra';

import { formatArgs } from '../util/args';
import { getCwd, getAbsolutePath } from '../util/path';

export const clean = async({ base, src }) => {
    const dir = path.join(base, src);
    return await fse.remove(dir);
};

const formats = {
    base: (input) => {
        return getAbsolutePath(getCwd(), input);
    },
};

export const command = 'clean';
export const describe = 'Clean files';
export const builder = {
    base: {
        describe: 'project base folder',
        type: 'string',
        default: getCwd(),
    },
    src: {
        describe: 'source folder',
        type: 'string',
        default: 'src',
    },
    symbol: {
        describe: 'symbol',
        type: 'boolean',
        default: true,
    },
};

/* tslint:disable no-console */
export const handler = async({ base, src, symbol }) => {
    const argv: any = await formatArgs(formats, { base, src });
    try {
        await clean(argv);
        if (symbol) {
            console.log(logSymbols.success, describe);
        }
    } catch (err) {
        if (symbol) {
            console.log(logSymbols.error, `${describe} ${chalk.red(err)}`);
        } else {
            console.error(err);
        }
        process.exit(1);
    }
};
