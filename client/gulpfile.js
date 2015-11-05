var gulp            = require('gulp'),
    // this is an arbitrary object that loads all gulp plugins in package.json.
    $         = require("gulp-load-plugins")(),
    express   = require('express'),
    path      = require('path'),
    tinylr    = require('tiny-lr'),
    app       = express(),
    server    = tinylr();

gulp.task('scss', function() {
    gulp.src('./src/scss/*.scss')
        .pipe($.plumber())
        .pipe($.compass({
            css: 'dist/css',
            sass: 'src/scss'
        }))
        .pipe(gulp.dest('dist/css'))
        .pipe( $.livereload( server ));
});

gulp.task('coffee', function() {
  return gulp.src('src/coffee/index.coffee', { read: false })
    .pipe($.plumber())
    .pipe($.browserify({
      debug: true,
      insertGlobals: false,
      transform: ['coffeeify'],
      extensions: ['.coffee']
    }))
    .pipe( $.rename('index.js') )
    .pipe( gulp.dest('dist/js') )
    .pipe( $.livereload( server ) );
});

gulp.task('images', function() {
  return gulp.src('./src/images/*')
    .pipe(gulp.dest('./dist/images'))
})

gulp.task('html', function() {
  return gulp.src('src/*.html')
    .pipe($.plumber())
    .pipe( gulp.dest('dist/') )
    .pipe( $.livereload( server ));
});

gulp.task('express', function() {
  app.use(express.static(path.resolve('./dist')));
  app.listen(1337);
  $.util.log('Listening on port: 1337');
});

gulp.task('watch', function () {
  server.listen(35729, function (err) {
    if (err) {
      return console.log(err);
    }

    gulp.watch('src/scss/*.scss',['scss']);

    gulp.watch('src/coffee/*.coffee',['coffee']);

    gulp.watch('src/*.html',['html']);

  });
});

gulp.task('build', ['coffee', 'scss', 'html', 'images']);
// Default Task
gulp.task('default', ['build', 'express','watch']);
