
import path from 'path';
import { getCwd } from '../util/path';

const dirName = getCwd();
const sourceFolderName = 'src';
const buildFolderName = 'build';

export const basePath = dirName;
export const sourcePath = sourceFolderName;
export const buildPath = buildFolderName;
export const exampleSourcePath = './examples';
export const exampleBuildPath = path.join(buildPath, 'build', 'examples');
export const templatePath = path.join(exampleSourcePath, 'index.html');
