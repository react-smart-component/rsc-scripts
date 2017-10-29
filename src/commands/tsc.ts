
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import * as ts from 'typescript';
import globPromise from 'glob-promise';
import path from 'path';
import fse from 'fs-extra';
import { formatArgs } from '../util/args';
import { getCwd, getAbsolutePath } from '../util/path';

function compile(fileNames, options) {
    return new Promise((resolve, reject) => {
        const program = ts.createProgram(fileNames, options);
        const emitResult = program.emit();

        const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
        let errorMsg = '';
        allDiagnostics.forEach((diagnostic: any) => {
            if (diagnostic.file) {
                const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '');
                errorMsg += `in [tsc] at ${diagnostic.file.fileName}:${line}:${character} \r\n ${message} \r\n `;
            }
        });
        if (errorMsg) {
            reject(new Error(errorMsg));
        } else {
            resolve();
        }
    });
}

export const tsc = async(args) => {
    const {
        base,
        src,
        output,
    } = args;
    const outputPath = path.join(base, output);
    const sourceFiles = await globPromise(path.join(base, src, '**', '*.ts?(x)'));
    let tsconfigPath = path.join(getCwd(), 'tsconfig.json');
    if (!fse.existsSync(tsconfigPath)) {
        tsconfigPath = path.join(getCwd(), '../../', 'tsconfig.json');
    }
    const compilerOptions = require(tsconfigPath).compilerOptions;
    const parsed = ts.convertCompilerOptionsFromJson(compilerOptions, outputPath);
    parsed.options.outDir = outputPath;
    parsed.options.declaration = true;
    await compile(sourceFiles, parsed.options);
};

const formats = {
    base: (input) => {
        return getAbsolutePath(getCwd(), input);
    },
};

export const command = 'tsc';
export const describe = 'tsc files';
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
export const handler = async(args) => {
    const {
        symbol,
        ...resetArgs,
    } = args;
    const argv: any = await formatArgs(formats, resetArgs);
    try {
        await tsc(argv);
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
