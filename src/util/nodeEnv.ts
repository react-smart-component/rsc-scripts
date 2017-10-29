
export const DEVELOPMENT = 'development';
export const PRODUCTION = 'production';

let NODE_ENV = process.env.NODE_ENV || PRODUCTION;

export default NODE_ENV;
