// Gulp and plugins
const gulp = require('gulp');
const closureCompiler = require('gulp-closure-compiler');
const env = require('gulp-env');
const header = require('gulp-header');
const jsdoc = require("gulp-jsdoc3");
const jshint = require('gulp-jshint');
const pkg = require('../package.json');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const rimraf = require('gulp-rimraf');
const sass = require('gulp-sass');
const testem = require('gulp-testem');
const uglify = require('gulp-uglify');
const umd = require('gulp-umd');

// paths
const src = './src';
const dist = './dist';
const doc = './doc';
const distJs = dist + '/js';
const distCss = dist + '/css';
const distImg = dist + '/images';
const distFont = dist + '/fonts';
const lib = './lib';
const jsFiles = [src + '/js/' + 'patra.js'];
const scssFiles = [src + '/scss/' + 'patra.scss'];
const htmlFiles = [src + '/html/' + '*.html'];
const imgFiles = [src + '/images/' + '*.*'];
const libJsFiles = [lib + '/js/' + "**/*"];
const libCssFiles = [lib + '/css/' + "**/*"];
const libFontFiles = [lib + '/fonts/' + "**/*"];
const demo = './demo';

const banner = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @author <%= pkg.author %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');

// deletes the distribution directory
gulp.task('clean', function () {
    return gulp.src([dist + '*', demo + '*'], {read: false})
        .pipe(rimraf());
});

// create 'metricsgraphics.js' and 'metricsgraphics.min.js' from source js
gulp.task('build:js', gulp.series('clean', function (done) {
    var stream = gulp.src(jsFiles)
        .pipe(umd(
            {
                dependencies: function () {
                    return [{
                        name: 'jquery',
                        amd: 'jquery',
                        cjs: 'jquery',
                        global: 'jQuery',
                        param: '$'
                    },
                        {
                            name: 'MG',
                            amd: 'MG',
                            cjs: 'MG',
                            global: 'MG',
                            param: 'MG'
                        },
                        {
                            name: 'jstree',
                            amd: 'jstree',
                            cjs: 'jstree',
                            global: 'jstree',
                            param: 'jstree'
                        }];
                },
                exports: function () {
                    return "patra";
                },
                namespace: function () {
                    return "patra";
                }
            }
        ))
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest(distJs))
        .pipe(rename('patra.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(distJs));

    stream.on('end', function () {
             done();
    });
}));

gulp.task('compile:js', gulp.series('clean', function () {
    return gulp.src(jsFiles)
        .pipe(gulp.dest(distJs))
        .pipe(closureCompiler({
            compilerPath: 'lib/closure/closure-compiler-v20200517.jar',
            fileName: 'patra.min.js',
            compilerFlags: {
                compilation_level: 'ADVANCED_OPTIMIZATIONS',
                warning_level: 'VERBOSE',
                externs: [
                    'lib/externs/jquery-3.5.1.js',
                    'lib/externs/metricgraphics-2.15.6.js',
                    'lib/externs/metricsviewer-2.0.0.js',
                    'lib/externs/jstree-3.3.0.js'
                ]
            }
        }))
        .pipe(gulp.dest(distJs));
}));

gulp.task('clean:doc', function () {
    return gulp.src([doc + '*'], {read: false})
        .pipe(rimraf());
});

gulp.task('set-debug-env', function (done) {
    env({
        vars: {
            DEBUG: "gulp-jsdoc3"
        }
    });
    done();
});

gulp.task('copy:img', function () {
    return gulp.src(imgFiles)
        .pipe(gulp.dest('./doc/src/images'));
});

gulp.task('doc', gulp.series('clean:doc', 'set-debug-env', function (callback) {
    gulp.src(['README.md'].concat(jsFiles), {read: false})
        .pipe(jsdoc({
            'opts': {
                'destination': './doc'
            },
            'plugins': [], // no plugins
            'templates': {
                'systemName': ' Patra',
                'navType': 'inline',
                'theme': 'flatly'
            }
        }, callback));


}, 'copy:img'));

// build css files from scss
gulp.task('build:css', function () {
    return gulp.src(scssFiles)
        .pipe(sass())
        .pipe(gulp.dest(distCss));
});

gulp.task('copy:html', function () {
    return gulp.src(htmlFiles)
        .pipe(gulp.dest(dist))
        .on('error', log);
});

gulp.task('copy:img', function () {
    return gulp.src(imgFiles)
        .pipe(gulp.dest(distImg))
        .on('error', log);
});

gulp.task('copy:lib:js', function () {
    return gulp.src(libJsFiles)
        .pipe(gulp.dest(distJs))
        .on('error', log);
});

gulp.task('copy:lib:css', function () {
    return gulp.src(libCssFiles)
        .pipe(gulp.dest(distCss))
        .on('error', log);
});

gulp.task('copy:lib:fonts', function () {
    return gulp.src(libFontFiles)
        .pipe(gulp.dest(distFont))
        .on('error', log);
});

gulp.task('clean:demo', function() {
    return  gulp.src([demo + '*'], {read: false})
        .pipe(rimraf());
});

gulp.task('copy:demo', gulp.series('clean:demo', function () {
    return gulp.src(dist + '/**/*')
        .pipe(gulp.dest(demo))
        .on('error', log);
}));

gulp.task('demo', gulp.series('copy:demo', function () {
    return gulp.src(dist + '/index.html')
        .pipe(replace('http://localhost:8080/metrics/metrics', '../data/metrics.json'))
        .pipe(gulp.dest(demo))
        .on('error', log);
}));

// Check source js files with jshint
gulp.task('jshint', function () {
    return gulp.src(jsFiles)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// Run the test suite
gulp.task('test', function () {
    return gulp.src(['.'],  {allowEmpty: true})
        .pipe(testem({
            configFile: 'testem.json'
        }));
});

gulp.task('default', gulp.series('clean', 'jshint', 'build:js', 'build:css', 'copy:html', 'copy:img',
    'copy:lib:js', 'copy:lib:css', 'copy:lib:fonts', 'demo'));

gulp.task('compile', function (done) {
    gulp.series('clean', 'jshint', 'compile:js', 'build:css', 'copy:html', 'copy:img',
        'copy:lib:js', 'copy:lib:css', 'copy:lib:fonts', 'demo');
    done();
});

function log(error) {
    console.error(error.toString && error.toString());
}