// Gulp and plugins
var gulp = require('gulp');
var closureCompiler = require('gulp-closure-compiler');
var header = require('gulp-header');
var jsdoc = require("gulp-jsdoc");
var jshint = require('gulp-jshint');
var pkg = require('../package.json');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var rimraf = require('gulp-rimraf');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var testem = require('gulp-testem');
var uglify = require('gulp-uglify');
//var util = require('gulp-util');
var umd = require('gulp-umd');

// paths
var src = './src';
var dist = './dist';
var doc = './doc';
var distJs = dist + '/js';
var distCss = dist + '/css';
var distImg = dist + '/images';
var distFont = dist + '/fonts';
var lib = './lib';
var jsFiles = [src + '/js/' + 'patra.js'];
var scssFiles = [src + '/scss/' + 'patra.scss'];
var htmlFiles = [src + '/html/' + '*.html'];
var imgFiles = [src + '/images/' + '*.*'];
var libJsFiles = [lib + '/js/' + "**/*"];
var libCssFiles = [lib + '/css/' + "**/*"];
var libFontFiles = [lib + '/fonts/' + "**/*"];
var demo = './demo';

var banner = ['/**',
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

gulp.task('doc', gulp.series('clean:doc', function () {
    return gulp.src(jsFiles)
        .pipe(jsdoc(doc));
}));

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