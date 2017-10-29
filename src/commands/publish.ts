
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import path from 'path';
import { registry } from '../configs/npm';
import { formatArgs } from '../util/args';
import { getCwd, getAbsolutePath } from '../util/path';
import { getGitStatusInfo } from '../util/git';
import { execLog, shell } from '../util/shell';

const release = async({ base, betaTag, output, runGitCheck, runBuild, runTest }) => {
    if (runGitCheck) {
        const gitStatusInfo = await getGitStatusInfo();
        if (gitStatusInfo) {
            throw new Error('git work directory is not clean');
        }
    }
    const branch = await shell('git', ['symbolic-ref', '--short', 'HEAD']);
    const { version } = require(path.join(base, 'package.json'));
    if (runBuild) {
        await execLog('npm', ['run', 'build']);
    }
    if (runTest) {
        await execLog('npm', ['run', 'test']);
    }
    process.chdir(path.join(base, output));

    if (version.includes('-')) {
        // beta version
        await execLog('npm', ['publish', `--registry=${registry}`, '--tag', betaTag]);
    } else {
        // stable version
        if (branch !== 'master') {
            throw new Error(`cannot publish stable version: ${version} to \`${betaTag}\` tag`);
        }
        await execLog('npm', ['publish', `--registry=${registry}`]);
    }
    process.chdir(path.join(base));
};

const formats = {
    base: (input) => {
        return getAbsolutePath(getCwd(), input);
    },
};

export const command = 'release';
export const describe = 'publish npm package';
export const builder = {
    runBuild: {
        describe: 'run npm build',
        type: 'boolean',
        default: false,
    },
    runTest: {
        describe: 'run npm test',
        type: 'boolean',
        default: false,
    },
    runGitCheck: {
        describe: 'run git status',
        type: 'boolean',
        default: false,
    },
    base: {
        describe: 'project base folder',
        type: 'string',
        default: getCwd(),
    },
    betaTag: {
        describe: 'beta tag name',
        type: 'string',
        default: 'beta',
    },
    output: {
        describe: 'output folder for npm package base',
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
export const handler = async({ base, betaTag, output, runBuild, runTest, runGitCheck, symbol }) => {
    const argv: any = await formatArgs(formats, { base, betaTag, output, runBuild, runTest, runGitCheck });
    try {
        await release(argv);
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
