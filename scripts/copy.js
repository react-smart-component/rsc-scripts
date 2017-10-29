import fse from 'fs-extra';
import path from 'path';

const copy = function(args) {
    const {
        base,
        output,
        fileName,
    } = args;
    const sourceFile = path.join(base, fileName);
    const outputFile = path.join(base, output, fileName);
    return new Promise(function(resolve, reject) {
        fse.copy(sourceFile, outputFile, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const copyFiles = async function(args) {
    const {
        fileNames,
        ...rest,
    } = args;
    const copyFileJobs = fileNames.map(function(fileName) {
        return copy({
            ...rest,
            fileName,
        });
    });
    await Promise.all(copyFileJobs);
};

export default copyFiles;

