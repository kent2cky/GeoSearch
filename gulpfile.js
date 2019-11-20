const gulp = require('gulp');
const jshint = require('gulp-jshint');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
// const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();
const imageMin = require('gulp-imagemin')
const eslint = require('gulp-eslint');
const gulpIf = require('gulp-if');

gulp.task('processHTML', gulp.series((done) => {
  gulp.src('*.html')
    .pipe(gulp.dest('dist'));
  done();
}));

gulp.task('processCSS', gulp.series((done) => {
  gulp.src('css/*.css')
    .pipe(gulp.dest('dist'));
  done();
}));


gulp.task('processJS', gulp.series((done) => {

  gulp.src('js/*.js')
    // .pipe(jshint({
    // 	esversion: 6
    // }))
    // .pipe(jshint.reporter('default'))
    .pipe(eslint())
    .pipe(eslint.format())
    // .pipe(babel({
    // 	presets: ['env']
    // }))
    // .pipe(terser())
    .pipe(gulp.dest('dist'));

  done();
}));


gulp.task('eslint', () => {
  return gulp.src('js/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
});

// new function added to check if ESLint has run the fix
function isFixed(file) {
  return file.eslint !== null && file.eslint.fixed;
}

// new lint and fix task
gulp.task('eslint-fix', () => {
  return gulp.src('js/*.js')
    .pipe(eslint({
      fix: true,
    }))
    .pipe(eslint.format())
    // if running fix - replace existing file with fixed one
    .pipe(gulpIf(isFixed, gulp.dest('dist')))
    .pipe(eslint.failAfterError())
});


gulp.task('imageSquash', gulp.series((done) => {
  gulp.src("img/*")
    .pipe(imageMin())
    .pipe(gulp.dest('dist/minImages'));
  done()
}));


gulp.task('babelPolyfill', gulp.series((done) => {
  gulp.src('node_modules/babel-polyfill/browser.js')
    .pipe(gulp.dest('dist/node_modules/babel-polyfill'));
  done();
}));

gulp.task('browserSync', () => {
  browserSync.init({
    server: './dist',
    port: 8080,
    ui: {
      port: 8081
    }
  });
});

gulp.task('watchJS', (done) => {
  gulp.watch('js/*.js', gulp.series('processJS'));
  done();
});

gulp.task('watchCSS', (done) => {
  gulp.watch('css/*.css', gulp.series('processCSS'));
  done();
});

gulp.task('watchHTML', (done) => {
  gulp.watch('*.html', gulp.series('processHTML'));
  done();
});
gulp.task('watchProdJS', (done) => {
  gulp.watch('dist/*.js').on("change", browserSync.reload);
  done();
});

gulp.task('watchProdHTML', (done) => {
  gulp.watch('dist/*.html').on("change", browserSync.reload);
  done();
});

gulp.task('watchProdCSS', (done) => {
  gulp.watch('dist/*.css').on("change", browserSync.reload);
  done();
});


gulp.task('watch', gulp.parallel('browserSync', 'watchJS', 'watchHTML', 'watchCSS', 'watchProdJS', 'watchProdHTML', 'watchProdCSS'));

gulp.task('default', gulp.series(
  'processHTML', 'processJS', 'processCSS', 'babelPolyfill', 'imageSquash', 'watch'
));