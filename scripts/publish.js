import path from 'path';
import execa from 'execa';
import * as configs from './config';

const base = configs.cwdPath;
const output = configs.outputPath;
const registry = configs.registry;

export const shellLog = (file, args) => {
    const promise = execa(file, args);
    promise.stdout.pipe(process.stdout);
    promise.stderr.pipe(process.stderr);
    return promise;
};

const shell = async(file, args) => {
    const {
        code,
        stdout,
    } = await execa(file, args);
    if (code === 0) {
        return stdout.split('\n')[0];
    } else {
        return null;
    }
};

const publish = async() => {
    const { version } = require(path.join(base, 'package.json'));
    const branch = await shell('git', ['symbolic-ref', '--short', 'HEAD']);
    await shellLog('npm', ['run', 'build']);
    const outputPath = path.join(base, output);
    process.chdir(outputPath);
    const publishCommands = ['publish', `--registry=${registry}`];
    if (version.indexOf('-') >= 0) {
        publishCommands.push(
            '--tag',
            'beta',
        );
    }
    if (branch !== 'master' && version.indexOf('-') === -1) {
        throw new Error(`version ${version} is an incorrect beta version`);
    } else {
        await shellLog('npm', publishCommands);
    }
    process.chdir(base);
};

publish().catch(function(err) {
    console.error(err);
});
