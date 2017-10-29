import * as ts from 'typescript';
import globPromise from 'glob-promise';
import path from 'path';

/**
 * ts compile method
 * @param {string[]} fileNames 编译的所有文件路径数组
 * @param {ts.CompilerOptions} options ts编译配置对象
 */
const compile = function (fileNames, options) {
    return new Promise((resolve, reject) => {
        const program = ts.createProgram(fileNames, options);
        const emitResult = program.emit();
        const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
        let errorMsg = '';
        allDiagnostics.forEach(function (diagnostic) {
            if (diagnostic.file) {
                const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                const message = ts.flattenDiagnosticMessageText(diagnostic.messageText);
                errorMsg += `in [tsc] at ${diagnostic.file.fileName}:${line}:${character} \r\n ${message} \r\n `;
            }
        });
        if (errorMsg) {
            reject(new Error(errorMsg));
        } else {
            resolve();
        }
    });
};

/**
 * typescript转换ts代码为es6
 * @param {String} base 项目的根路径
 * @param {String} src 相对项目根目录的源文件路径
 * @param {String} output 相对项目根目录的源文件路径
 * @returns {Promise}
 */
const tsc = async function (args) {
    const {
        base,
        src,
        output,
    } = args;
    const outputPath = path.join(base, output);
    const sourceFiles = await globPromise(path.join(base, src, '**', '*.ts'));
    let tsconfigPath = path.join(base, 'tsconfig.json');
    const compilerOptions = require(tsconfigPath).compilerOptions;
    const parsed = ts.convertCompilerOptionsFromJson(compilerOptions, outputPath);
    parsed.options.outDir = outputPath;
    parsed.options.declaration = true;
    await compile(sourceFiles, parsed.options);
};

export default tsc;
