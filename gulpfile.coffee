browserify = require('browserify')
coffeeify = require('coffeeify')
derequire = require('gulp-derequire')
gulp = require('gulp')
gutil = require('gulp-util')
mocha = require('gulp-mocha')
rename = require('gulp-rename')
rimraf = require('gulp-rimraf')
source = require('vinyl-source-stream')
uglify = require('gulp-uglify')

gulp.task 'clean', ->
  gulp.src('./sorted-set.js', { read: false, allowEmpty: true })
    .pipe(rimraf())

gulp.task 'browserify', gulp.series('clean', ->
  b = browserify('./src/SortedSet.coffee', {
    extensions: [ '.js', '.coffee' ]
    standalone: 'SortedSet'
  })
  b.transform(coffeeify)

  b.bundle()
    .on('error', (e) -> gutil.log('Browserify error', e))
    .pipe(source('sorted-set.js'))
    .pipe(derequire())
    .pipe(gulp.dest('.')))

gulp.task 'minify', gulp.series('browserify', ->
  gulp.src('sorted-set.js')
    .pipe(uglify())
    .pipe(rename(suffix: '.min'))
    .pipe(gulp.dest('.')))

gulp.task 'test', gulp.series( ->
  gulp.src('test/**/*Spec.coffee', read: false)
    .pipe(mocha({
      require: 'coffee-script/register'
      reporter: 'dot'
    }))
    .on('error', gutil.log))

gulp.task('default', gulp.series('minify'))
