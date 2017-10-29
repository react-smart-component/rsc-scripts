
import execa from 'execa';

export const execLog = (file, args) => {
    const promise = execa(file, args);
    promise.stdout.pipe(process.stdout);
    promise.stderr.pipe(process.stderr);
    return promise;
};

export const shell = async(file, args) => {
    const {
        code,
        stdout,
    } = await execa(file, args);
    if (code === 0) {
        return stdout.split('\n')[0];
    }
    return null;
};
