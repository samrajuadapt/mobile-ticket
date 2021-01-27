const { series, src, dest } = require('gulp');
const del = require('del');
const _ = require('lodash');
const jsonfile = require('jsonfile');
const path = require('path');
const argv = require('yargs').argv;
let srcPath;
let destPath;
const DELETE_KEY = 'marked_to_remove';

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
            '!./proxy-config.json',
            './mt-service/*',
            '!./mt-service',
            './mt-service/src/*',
            '!./mt-service/src',
            '!./mt-service/src/config',
        ], { force: true, cwd: destPath });
    } else {
        return console.log("please set the dest value to continue");

    }
}

async function copyForUpgrade() {
    if (srcPath && destPath) {
        return src(['./**/*', '!./upgrade-helper', '!./upgrade-helper/**/*'], { cwd: srcPath })
            .pipe(dest('./', { cwd: destPath, overwrite: false }));
    }
}

async function cleanForInstall() {
    if (srcPath && destPath) {
        return del([
            './*'
        ], { force: true, cwd: destPath });
    } else {
        console.log("please set the dest value to continue");
        return;
    }
}

async function copyForInstall() {
    if (srcPath && destPath) {
        return src(['./**/*', '!./upgrade-helper', '!./upgrade-helper/**/*'], { cwd: srcPath })
            .pipe(dest('./', { cwd: destPath }));
    }
}

async function updateProxyConfig() {

    if (srcPath && destPath) {
        const srcFile = jsonfile.readFileSync(path.join(srcPath, '/proxy-config.json'));
        const destFile = jsonfile.readFileSync(path.join(destPath, '/proxy-config.json'));
        _.forEach(srcFile, function (value, key) {
            if (value != DELETE_KEY && !(_.has(destFile, key))) {
                _.set(destFile, key, value);
                console.log('new key "' + key + '" added');
            } else if (value == DELETE_KEY && _.has(destFile, key)) {
                _.unset(destFile, key);
                console.log('key "' + key + '" deleted');

            }
        });
        jsonfile.writeFileSync(path.join(destPath, '/proxy-config.json'), destFile, { spaces: 2, EOL: '\r\n' });
    }
}

async function updateServiceConfig() {

    if (srcPath && destPath) {
        const srcFile = jsonfile.readFileSync(path.join(srcPath, '/mt-service/src/config/config.json'));
        const destFile = jsonfile.readFileSync(path.join(destPath, '/mt-service/src/config/config.json'));
        _.forEach(srcFile, function (value, key) {
            if (value != DELETE_KEY && !(_.has(destFile, key))) {
                _.set(destFile, key, value);
                console.log('new key "' + key + '" added');
            } else if (value == DELETE_KEY && _.has(destFile, key)) {
                _.unset(destFile, key);
                console.log('key "' + key + '" deleted');
            }
        });
        jsonfile.writeFileSync(path.join(destPath, '/mt-service/src/config/config.json'), destFile, { spaces: 2, EOL: '\r\n' });
    }
}

async function updateConfig() {
    if (srcPath && destPath) {
        const srcFile = jsonfile.readFileSync(path.join(srcPath, '/src/app/config/config.json'));
        const destFile = jsonfile.readFileSync(path.join(destPath, '/src/app/config/config.json'));
        _.forEach(srcFile, function (value, key) {
            if (value != DELETE_KEY && !(_.has(destFile, key))) {
                _.set(destFile, key, value);
                console.log('new key "' + key + '" added');
            } else if (value == DELETE_KEY && _.has(destFile, key)) {
                _.unset(destFile, key);
                console.log('key "' + key + '" deleted');
            }
        });
        jsonfile.writeFileSync(path.join(destPath, '/src/app/config/config.json'), destFile, { spaces: 2, EOL: '\r\n' });
    }
}

async function updateLocale() {
    if (srcPath && destPath) {
        const srcFile = jsonfile.readFileSync(path.join(srcPath, '/src/app/locale/en.json'));
        const destFile = jsonfile.readFileSync(path.join(destPath, '/src/app/locale/en.json'));
        _.forEach(srcFile, function (rootValue, rootKey) {
            if (rootValue != DELETE_KEY && !(_.has(destFile, rootKey))) {
                _.set(destFile, rootKey, rootValue);
                console.log('new key "' + rootKey + '" added');
            } else if (rootValue == DELETE_KEY && _.has(destFile, rootKey)) {
                _.unset(destFile, rootKey);
                console.log('key "' + rootKey + '" deleted');
            }
            else {
                _.forEach(rootValue, function (levelOneValue, levelOneKey) {
                    if (levelOneValue != DELETE_KEY && !(_.has(destFile[rootKey], levelOneKey))) {
                        _.set(destFile[rootKey], levelOneKey, levelOneValue);
                        console.log('new key "' + levelOneKey + '" added');
                    } else if (levelOneValue == DELETE_KEY && _.has(destFile, levelOneKey)) {
                        _.unset(destFile[rootKey], levelOneKey);
                        console.log('key "' + levelOneKey + '" deleted');
                    }
                    else {
                        _.forEach(levelOneValue, function (levelTwoValue, levelTwoKey) {
                            if (levelTwoValue != DELETE_KEY && !(_.has(destFile[rootKey][levelOneKey], levelTwoKey))) {
                                _.set(destFile[rootKey][levelOneKey], levelTwoKey, levelTwoValue);
                                console.log('new key "' + levelTwoKey + '" added');
                            } else if (levelTwoValue == DELETE_KEY && _.has(destFile, levelTwoKey)) {
                                _.unset(destFile[rootKey][levelOneKey], levelTwoKey);
                                console.log('key "' + levelTwoKey + '" deleted');
                            }
                            else {
                                //this is deep enough for now
                            }
                        });
                    }
                });
            }
        });
        jsonfile.writeFileSync(path.join(destPath, '/src/app/locale/en.json'), destFile, { spaces: 2, EOL: '\r\n' });
    }
}

async function updateResources() {
    if (srcPath && destPath) {
        return src(['./src/app/resources/*'], { cwd: srcPath })
            .pipe(dest('./src/app/resources/', { cwd: destPath, overwrite: false }));
    }
}

exports.upgrade = series(cleanForUpgrade, copyForUpgrade, updateProxyConfig, updateServiceConfig, updateConfig, updateLocale, updateResources);
exports.install = series(cleanForInstall, copyForInstall);