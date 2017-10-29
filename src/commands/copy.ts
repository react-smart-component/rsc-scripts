
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import path from 'path';
import fse from 'fs-extra';
import globPromise from 'glob-promise';

import { formatArgs } from '../util/args';
import { getCwd, getAbsolutePath } from '../util/path';

const copyFile = async(filePath, sourcePath, outputPath) => {
    const sourceFile = path.join(sourcePath, filePath);
    const outputFile = path.join(outputPath, filePath);
    return await fse.copy(sourceFile, outputFile);
};

const globFile = async(sourcePath, glob) => {
    return await globPromise(path.join(sourcePath, glob), { nodir: true });
};

const addToList = (listA, listB) => {
    return listB.reduce((acc, item) => {
        if (!acc.includes(item)) {
            return [...acc, item];
        }
        return acc;
    }, listA);
};

const getReducedGlobFiles = async(sourcePath, globs) => {
    const globJobs = globs.map((globItem) => {
        return globFile(sourcePath, globItem);
    });
    const results = await Promise.all(globJobs);
    const reducedResults = results.reduce((acc, list) => {
        return addToList(acc, list);
    }, []);
    return reducedResults.map((absoluteFile) => {
        return path.relative(sourcePath, absoluteFile);
    });
};

export const copy = async({ base, glob, src, output }) => {
    const sourcePath = path.join(base, src);
    const outputPath = path.join(base, output);
    const files = await getReducedGlobFiles(sourcePath, glob);
    const copyFileJobs = files.map((file) => {
        return copyFile(file, sourcePath, outputPath);
    });
    await Promise.all(copyFileJobs);
};

const formats = {
    base: (input) => {
        return getAbsolutePath(getCwd(), input);
    },
    glob: (input = ['**/**']) => {
        if (Array.isArray(input)) {
            return input;
        }
        return [input];
    },
};

export const command = 'copy';
export const describe = 'Copy files';
export const builder = {
    base: {
        describe: 'project base folder',
        type: 'string',
        default: getCwd(),
    },
    glob: {
        describe: 'glob pattern',
    },
    src: {
        describe: 'source folder',
        type: 'string',
        default: 'src',
    },
    output: {
        describe: 'output folder',
        type: 'string',
        default: 'build',
    },
    symbol: {
        describe: 'symbol',
        type: 'boolean',
        default: true,
    },
};

/* tslint:disable no-console */
export const handler = async({ base, glob, src, output, symbol }) => {
    const argv: any = await formatArgs(formats, { base, glob, src, output });
    try {
        await copy(argv);
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
