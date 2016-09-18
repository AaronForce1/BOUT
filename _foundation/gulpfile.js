var $      = require('gulp-load-plugins')();
var argv   = require('yargs').argv;
var browser = require('browser-sync');
var gulp   = require('gulp');
var rimraf = require('rimraf');
var panini = require('panini');
var sequence = require('run-sequence');
var sherpa = require('style-sherpa');
var sassGlob = require('gulp-sass-glob');
var lab = require('gulp-lab');
var copy = require('gulp-copy');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var rename = require('gulp-rename');
var gulpif = require('gulp-if');

// Check for --production flag
var isProduction = !!(argv.production);
var minifycss = $.if(isProduction, cssnano());

// Port to use for the development server.
var PORT = 9000;

// Browsers to target when prefixing CSS.
var COMPATIBILITY = ['last 2 versions', 'ie >= 9'];

// File paths to various assets are defined here.
var PATHS = {
  assets: [
    'src/assets/**/*',
    '!src/assets/{!img,js,scss}/**/*'
  ],
  sass: [
    'node_modules/foundation-sites/scss',
    'node_modules/motion-ui/src/'
  ],
  javascript: [
    'node_modules/foundation-sites/vendor/jquery/dist/jquery.js',
    'node_modules/what-input/what-input.js',
    'node_modules/foundation-sites/dist/foundation.js',
    'src/assets/js/**/*.js',
    'src/assets/js/app.js'
  ],
  output: {
    css: '../Styles',
    javascript: '../Scripts',
  }
};

// Delete the "dist" folder
// This happens every time a build starts
gulp.task('clean', function(done) {
  rimraf('./dist', done);
});

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
gulp.task('copy', function() {
  gulp.src(PATHS.assets)
    .pipe(gulp.dest('./dist/assets'));
});

// Copy page templates into finished HTML files
gulp.task('pages', function() {
  gulp.src('./src/pages/**/*.{html,hbs,handlebars}')
    .pipe(panini({
      root: './src/pages/',
      layouts: './src/layouts/',
      partials: './src/partials/',
      data: './src/data/',
      helpers: './src/helpers/'
    }))
    .pipe(gulp.dest('./dist'));
});


// Gulp Rebuilding Partials!
gulp.task('refresh', function(cb){
  panini.refresh();
  cb();
});

gulp.task('pages-rebuild', ['refresh'], function(cb) {
  gulp.src('./src/pages/**/*.{html,hbs,handlebars}')
    .pipe(panini({
      root: './src/pages/',
      layouts: './src/layouts/',
      partials: './src/partials/',
      data: './src/data/',
      helpers: './src/helpers/'
    }))
    .pipe(gulp.dest('./dist'));
    cb()
});

gulp.task('reset', ['pages-rebuild'], function(){
  setTimeout(function(){
    browser.reload();
  }, 2000);
});


// WRAP GULP FUNCTIONS TOGETHER IN QUEUE
gulp.task('pages:reset', ['refresh', 'pages-rebuild', 'reset']);

// Compile Sass into CSS
// In production, the CSS is compressed
gulp.task('sass', function () {
  var minifycss = $.if(isProduction, cssnano());

  return gulp.src('./src/assets/scss/app.scss')
    .pipe(sassGlob())
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: PATHS.sass
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: COMPATIBILITY
    }))
    //.pipe(uncss) Causing issues when in production
    .pipe(minifycss)
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest('./dist/assets/css'))
    //.pipe(gulpif(isPublish, gulp.dest(PATHS.publish.css)));
});

// gulp.task('sass', function() {
//   var uncss = $.if(isProduction, $.uncss({
//     html: ['src/**/*.html'],
//     ignore: [
//       new RegExp('^meta\..*'),
//       new RegExp('^\.is-.*')
//     ]
//   }));

//   var minifycss = $.if(isProduction, $.minifyCss());

//   return gulp.src('./src/assets/scss/app.scss')
//     .pipe(sassGlob())
//     .pipe($.sourcemaps.init())
//     .pipe($.sass({
//       includePaths: PATHS.sass
//     })
//       .on('error', $.sass.logError))
//     .pipe($.autoprefixer({
//       browsers: COMPATIBILITY
//     }))
//     //.pipe(uncss) Causing issues when in production
//     .pipe(minifycss)
//     .pipe($.if(!isProduction, $.sourcemaps.write()))
//     .pipe(gulp.dest('./dist/assets/css'));
// });

// Combine JavaScript into one file
// In production, the file is minified
gulp.task('javascript', function() {
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src(PATHS.javascript)
    .pipe($.sourcemaps.init())
    .pipe($.concat('app.js'))
    //.pipe(modernizr())
    .pipe(uglify)
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest('./dist/assets/js'));
});

// Copy images to the "dist" folder
// In production, the images are compressed
gulp.task('images', function() {
  var imagemin = $.if(isProduction, $.imagemin({
    progressive: true
  }));

  return gulp.src('./src/assets/img/**/*')
    .pipe(imagemin)
    .pipe(gulp.dest('./dist/assets/img'));
});

// Build the "dist" folder by running all of the above tasks
gulp.task('build', function(done) {
  sequence('clean', ['pages', 'sass', 'javascript', 'images', 'copy'], done);
});

gulp.task('development', function(done) {
  sequence('clean', ['pages', 'sass', 'javascript', 'images', 'copy'], 'watch');
});

// Build the site, run the server, and watch for file changes
gulp.task('watch', function() {
  gulp.watch(['./src/pages/**/*.html'], ['pages']);
  gulp.watch(['./src/{layouts,partials}/**/*.html'], ['pages:reset']);
  gulp.watch(['./src/data/**/*.yml'], ['pages:reset']);
  gulp.watch(['./src/assets/scss/**/*.scss'], ['sass']);
  gulp.watch(['./src/partials/**/*.scss'], ['sass']);
  gulp.watch(['./src/assets/js/**/*.js'], ['javascript']);
  gulp.watch(['./src/assets/img/*'], ['copy']);
});


// Start a server with LiveReload to preview the site in
gulp.task('server', ['build'], function() {
  browser.init({
    server: './dist', port: PORT
  });
});


gulp.task('minify-js', function() {
  gulp.src('dist/assets/js/app.js')
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(PATHS.output.javascript))
});

gulp.task('minify-css', function() {
  return gulp.src('dist/assets/css/app.css')
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(PATHS.output.css));
});

// Build the site, run the server, and watch for file changes
gulp.task('default', ['build', 'server'], function() {
  gulp.watch(PATHS.assets, ['copy', browser.reload]);
  gulp.watch(['./src/pages/**/*.html'], ['pages', browser.reload]);
  gulp.watch(['./src/{layouts,partials}/**/*.html'], ['pages:reset']);
  gulp.watch(['./src/assets/scss/**/*.scss'], ['sass', browser.reload]);
  gulp.watch(['./src/partials/**/*.scss'], ['sass', browser.reload]);
  gulp.watch(['./src/assets/js/**/*.js'], ['javascript', browser.reload]);
  gulp.watch(['./src/assets/img/**/*'], ['images', browser.reload]);
});
