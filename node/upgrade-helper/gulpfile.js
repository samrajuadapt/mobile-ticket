const { series, src, dest } = require('gulp');
const del = require('del');
const _ = require('lodash');
const jsonfile = require('jsonfile');
const path = require('path');
var argv = require('yargs').argv;
let srcPath;
let destPath;

srcPath = argv.src || process.cwd();
destPath = argv.dest;
console.log('srcPath = ' + srcPath);
console.log('destPath = ' + destPath);

async function cleanForUpgrade() {
    if (srcPath && destPath) {
        return del([
            './*',
            './src/*',
            '!./src',
            '!./src/app',
            '!./proxy-config.json'
        ], { force: true, cwd: destPath });
    } else {
        return console.log("plese set the dest value to continue");

    }
}

async function copyForUpgrade() {
    if (srcPath && destPath) {
        return src(['./**/*', '!./upgrade-helper', '!./upgrade-helper/*'], { cwd: srcPath })
            .pipe(dest('./', { cwd: destPath, overwrite: false }));
    }
}

async function cleanForInstall() {
    if (srcPath && destPath) {
        return del([
            './*'
        ], { force: true, cwd: destPath });
    } else {
        console.log("plese set the dest value to continue");
        return;
    }
}

async function copyForInstall() {
    if (srcPath && destPath) {
        return src(['./**/*', '!./upgrade-helper', '!./upgrade-helper/*'], { cwd: srcPath })
            .pipe(dest('./', { cwd: destPath }));
    }
}

async function updateProxyConfig() {

    if (srcPath && destPath) {
        const srcFile = jsonfile.readFileSync(path.join(srcPath, '/proxy-config.json'));
        const destFile = jsonfile.readFileSync(path.join(destPath, '/proxy-config.json'));
        _.forEach(srcFile, function (value, key) {
            if (!(_.has(destFile, key))) {
                _.set(destFile, key, value)
            } else if (value['value'] == 'delete') {
                _.unset(destFile, key);
            }
        });
        jsonfile.writeFileSync(path.join(destPath, '/proxy-config.json'), destFile);
    }
}

async function updateConfig() {
    if (srcPath && destPath) {
        const srcFile = jsonfile.readFileSync(path.join(srcPath, '/src/app/config/config.json'));
        const destFile = jsonfile.readFileSync(path.join(destPath, '/src/app/config/config.json'));
        _.forEach(srcFile, function (value, key) {
            if (!(_.has(destFile, key))) {
                _.set(destFile, key, value)
            } else if (value['value'] == 'delete') {
                _.unset(destFile, key);
            }
        });
        jsonfile.writeFileSync(path.join(destPath, '/src/app/config/config.json'), destFile);
    }
}

async function updateLocale() {
    if (srcPath && destPath) {
        const srcFile = jsonfile.readFileSync(path.join(srcPath, '/src/app/locale/en.json'));
        const destFile = jsonfile.readFileSync(path.join(destPath, '/src/app/locale/en.json'));
        _.forEach(srcFile, function (rootValue, rootKey) {
            if (!(_.has(destFile, rootKey))) {
                _.set(destFile, rootKey, rootValue);
            } else if (rootValue == 'delete') {
                _.unset(destFile, rootKey);
            }
            else {
                _.forEach(rootValue, function (levelOneValue, levelOneKey) {
                    if (!(_.has(destFile[rootKey], levelOneKey))) {
                        _.set(destFile[rootKey], levelOneKey, levelOneValue);
                    } else if (levelOneValue == 'delete') {
                        _.unset(destFile[rootKey], levelOneKey);
                    }
                    else {
                        _.forEach(levelOneValue, function (levelTwoValue, levelTwoKey) {
                            if (!(_.has(destFile[rootKey][levelOneKey], levelTwoKey))) {
                                _.set(destFile[rootKey][levelOneKey], levelTwoKey, levelTwoValue);
                            } else if (levelTwoValue == 'delete') {
                                _.unset(destFile[rootKey][levelOneKey], levelTwoKey);
                            }
                            else {
                                //this is deep enough for now
                            }
                        });
                    }
                });
            }
        });
        jsonfile.writeFileSync(path.join(destPath, '/src/app/locale/en.json'), destFile);
    }
}

exports.upgrade = series(cleanForUpgrade, copyForUpgrade, updateProxyConfig, updateConfig, updateLocale);
exports.install = series(cleanForInstall, copyForInstall);