#!/usr/bin/env node

import 'babel-polyfill';
import yargs from 'yargs';

const initializeYargs = () => {
    return yargs.commandDir('./commands').help().version().argv._;
};
initializeYargs();
