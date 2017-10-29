
import { shell } from './shell';

export const getGitStatusInfo = async() => {
    return await shell('git', ['status', '--porcelain']);
};
