import path from 'path';
import fse from 'fs-extra';
import globPromise from 'glob-promise';
import * as babelCore from 'babel-core';

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

/**
 * babel compile method
 * @param sourceFolder 源文件目录路径
 * @param outputFolder 输出文件目录路径
 * @returns {Promise.<void>}
 */
const complie = async function (sourceFolder, outputFolder) {
    const sourceFiles = await globPromise(path.join(sourceFolder, '**', '*.js'));
    const transformJobs = sourceFiles.map(function (sourceFile) {
        return babelTransformFile(sourceFile);
    });
    const transformResults = await Promise.all(transformJobs);
    const ouputJobs = transformResults.map(function(transformResult) {
        const {
            options,
            code,
        } = transformResult;
        return outputTransformFile(options.filename, code);
    });
    await Promise.all(ouputJobs);
};

/**
 * babel转换es6代码为es5
 * @param {String} base 项目的根路径
 * @param {String} src 相对项目根目录的源文件路径
 * @param {String} output 相对项目根目录的源文件路径
 * @returns {Promise}
 */
const babel = async function (args) {
    const {
        base,
        output,
    } = args;
    const sourceFolder = path.join(base, output);
    const outputFolder = path.join(base, output);
    return await complie(sourceFolder, outputFolder);
};

export default babel;
