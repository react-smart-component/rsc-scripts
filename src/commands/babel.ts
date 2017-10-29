
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import path from 'path';
import fse from 'fs-extra';
import globPromise from 'glob-promise';
import * as babelCore from 'babel-core';

import { formatArgs } from '../util/args';
import { getCwd, getAbsolutePath } from '../util/path';

const babelTransformFile = function (filePath) {
    return new Promise(function (resolve, reject) {
        babelCore.transformFile(filePath, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const outputTransformFile = function(filePath, content) {
    return new Promise(function(resolve, reject) {
        fse.writeFile(filePath, content, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const complie = async function (sourceFolder, outputFolder) {
    const sourceFiles = await globPromise(path.join(sourceFolder, '**', '*.js'));
    const transformJobs = sourceFiles.map(function (sourceFile) {
        return babelTransformFile(sourceFile);
    });
    const transformResults = await Promise.all(transformJobs);
    const ouputJobs = transformResults.map(function(transformResult: any) {
        const {
            options,
            code,
        } = transformResult;
        const { base: fileName } = path.parse(options.filename);
        const outputFileName = path.join(outputFolder, fileName);
        return outputTransformFile(outputFileName, code);
    });
    await Promise.all(ouputJobs);
};

const babel = async function (args) {
    const {
        base,
        src,
        output,
    } = args;
    const sourceFolder = path.join(base, src);
    const outputFolder = path.join(base, output);
    return await complie(sourceFolder, outputFolder);
};

const formats = {
    base: (input) => {
        return getAbsolutePath(getCwd(), input);
    },
};

export const command = 'babel';
export const describe = 'Babel files';
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
export const handler = async({ base, src, output, symbol }) => {
    const argv = await formatArgs(formats, { base, src, output });
    try {
        await babel(argv);
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
