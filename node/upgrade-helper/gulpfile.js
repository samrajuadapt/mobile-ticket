const { series, src, dest } = require('gulp');
const del = require('del');
let srcPath;
let destPath;

// fetch command line arguments
const arg = (argList => {

    let arg = {}, a, opt, thisOpt, curOpt;
    for (a = 0; a < argList.length; a++) {

        thisOpt = argList[a].trim();
        opt = thisOpt.replace(/^\-+/, '');

        if (opt === thisOpt) {

            // argument value
            if (curOpt) arg[curOpt] = opt;
            curOpt = null;

        }
        else {

            // argument name
            curOpt = opt;
            arg[curOpt] = true;

        }

    }

    return arg;

})(process.argv);

srcPath = arg.src || process.cwd();
destPath = arg.dest;
console.log('srcPath = '+srcPath);
console.log('destPath = '+destPath);

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
        return src('./**/*', { cwd: srcPath })
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
        return src('./**/*', { cwd: srcPath })
            .pipe(dest('./', { cwd: destPath }));
    }
}

exports.upgrade = series(cleanForUpgrade, copyForUpgrade);
exports.install = series(cleanForInstall, copyForInstall);