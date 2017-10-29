import logSymbols from 'log-symbols';
import * as configs from './config';
import tsc from './tsc';
import babel from './babel';
import copyFiles from './copy';

const base = configs.cwdPath;
const src = configs.srcPath;
const output = configs.outputPath;
const args = {
    base,
    src,
    output,
};

const fileNames = [
    'package.json',
    'LICENSE',
    'README.md',
    'CHANGELOG.md',
];
const description = 'build';
const build = async function() {
    try {
        console.log('start tsc...');
        await tsc(args);

        console.log('start babel...');
        await babel(args);

        console.log('start copyFiles...');
        await copyFiles({
            base,
            output,
            fileNames,
        });

        console.log(logSymbols.success, description);
    } catch(err) {
        console.log(logSymbols.error, description);
        console.log(err);
    }
};
build();
