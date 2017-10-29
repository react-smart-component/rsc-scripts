
import path from 'path';

export const getCwd = () => {
    return process.cwd();
};

export const getAbsolutePath = (base, input) => {
    if (path.isAbsolute(input)) {
        return input;
    }
    return path.join(base, input);
};
