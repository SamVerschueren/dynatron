'use strict';

/**
 * Gulp tasks.
 *
 * @author Sam Verschueren      <sam.verschueren@gmail.com>
 * @since  14 Sep. 2015
 */

// module dependencies
var path = require('path'),
    gulp = require('gulp'),
    bower = require('gulp-bower'),
    header = require('gulp-header'),
    sass = require('gulp-sass'),
    htmlreplace = require('gulp-html-replace'),
    htmlmin = require('gulp-htmlmin'),
    cssmin = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    gulpif = require('gulp-if'),
    lazypipe = require('lazypipe'),
    moment = require('moment'),
    del = require('del'),
    merge = require('merge2'),
    _ = require('lodash');

var pkg = require('./package.json'),
    dest = 'dist',
    banner = ['/**',
              ' * <%= pkg.name %> v<%= pkg.version %>',
              ' * License ' + pkg.license,
              ' *',
              ' * @author <%= pkg.author.name %>     <<%= pkg.author.email %>>',
              ' * @since  ' + moment().format('DD MMM. YYYY'),
              ' */\n'].join('\n');

/**
 * This builder function is a helper function that helps building a pipeline
 * that is used very often. The pipeline basically concatenates all the files
 * and executes a certain function on it like minifying or uglifying. It
 * prepends a banner to the files and if the maps parameter is set to true, it
 * will generate sourcemaps for the generated file.
 *
 * Example usages for this function are
 *
 *     builder(uglify, 'Controllers.min.js')                            -> no sourcemaps
 *     builder(uglify, 'Controllers.min.js', true)                      -> sourcemaps
 *     builder(cssmin, 'fonts.min.css', {keepSpecialComments: 0})       -> no sourcemaps, removes special comments
 *     builder(cssmin, 'fonts.min.css', true, {keepSpecialComments: 0}) -> sourcemaps, removes special comments
 *
 * @param  {Function} fn       The function to execute (uglify, htmlmin, cssmin)
 * @param  {String}   filename The filename that should be used.
 * @param  {Boolean}  maps     [optional] True if you want source maps; false otherwise.
 * @param  {Object}   options  [optional] Extra options for the fn function.
 * @return {Function}          A pipeline constructed by the arguments.
 */
function builder(fn, filename, maps, options) {
    if(_.isPlainObject(maps)) {
        // If maps is a plain object, the maps parameter is the options parameter
        options = maps;
        maps = false;
    }

    // Create and return the pipeline
    return lazypipe()
            .pipe(function() {
                return gulpif(maps === true, sourcemaps.init());
            })
            .pipe(concat, filename)
            .pipe(fn, options || {})
            .pipe(header, banner, {pkg: pkg})
            .pipe(function() {
                return gulpif(maps === true, sourcemaps.write('.'));
            })();
}

/**
 * The clean tasks removes the dist folder so that a clean build
 * can be done.
 */
gulp.task('clean', function(cb) {
    return del('dist');
});

/**
 * The sass task compiles the SCSS files to css files.
 */
gulp.task('sass', function() {
    return gulp.src('assets/style/**/*.scss', {cwd: 'src'})
        .pipe(sass({errLogToConsole: true}))
        .pipe(gulp.dest('assets/style', {cwd: 'src'}));
});

/**
 * Install the bower components.
 */
gulp.task('bower', function() {
    return bower();
});

/**
 * The uglify task uglifies everything that can be uglified. It uglifies all
 * the controllers, services, models and so on.
 */
gulp.task('uglify', ['clean', 'bower'], function() {
    var libraries = gulp.src([
            'bower_components/angular/angular.min.js',
            'bower_components/angular-route/angular-route.min.js'
        ], {cwd: 'src'})
        .pipe(builder(uglify, 'Libraries.min.js'))
        .pipe(gulp.dest(path.join(dest, 'libs')));

    return merge(libraries);
});


/**
 * The minify task minifies everything that can be minified. It minifies all the
 * html files, the i18n json files, css files and images.
 */
gulp.task('minify', ['clean', 'sass'], function() {
    var replacements = {
        'css': ['assets/fonts/fonts.min.css', 'assets/style/style.min.css'],
        'js': ['libs/Libraries.min.js']
    };

    var index = gulp.src('index.html', {cwd: 'src'})
        .pipe(htmlreplace(replacements, {keepUnassigned: true}))
        .pipe(htmlmin({removeComments: true, collapseWhitespace: true}))
        .pipe(gulp.dest('dist'));

    var svg = gulp.src(['assets/images/**/*.svg'], {cwd: 'src'})
        .pipe(htmlmin({removeComments: true, collapseWhitespace: true}))
        .pipe(gulp.dest(path.join(dest, 'assets/images')));

    var style = gulp.src(['assets/style/app.css', 'assets/style/**/*.css'], {cwd: 'src'})
        .pipe(builder(cssmin, 'style.min.css'))
        .pipe(gulp.dest(path.join(dest, 'assets/style')));

    return merge(index, svg, style);
});

/**
 * Watch files that should be transpiled.
 */
gulp.task('watch', function() {
    watch('src/**/*.scss', function(file) {
        console.log('\t' + path.basename(file.path) + ' has been changed, running sass...');
        gulp.start('sass');
    }).on('error', handleError);

    function handleError(err) {
        console.error(err.stack);
    }
});

/**
 * Build the entire project.
 */
gulp.task('build', ['clean', 'uglify', 'minify']);

/**
 * The default task will run the build task.
 */
gulp.task('default', ['build']);