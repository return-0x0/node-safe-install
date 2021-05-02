#!/usr/bin/env node

var install = require('../lib/index');
var child_process = require('child_process');

const args = process.argv.slice(2);

const extractedPackages = install.extractPackages();

child_process.execSync(`npm i ${args.join(' ')}`);

install.injectPackages(null, ...extractedPackages);