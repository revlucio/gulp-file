var gulp = require('gulp');
var del = require('del');
var templateCache = require('gulp-angular-templatecache');
var Server = require('karma').Server;
var $ = require('gulp-load-plugins')();

//========================

var filename = 'app.' + Date.now() + '.';
var folder = 'dist';

gulp.task('ci', ['bower', 'test', 'clean', 'build']);
gulp.task('default', ['ci', 'watch']);

gulp.task('watch', function() {
  var watcher = gulp.watch(
    [
      'src/scripts/**/*.js',
      'src/css/**/*.css',
      'src/partials/**/*.html',
      'src/index.html'
    ], ['test', 'clean','build']);
  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });  
});

gulp.task('bower', function() {
  return $.bower()
});

gulp.task('wiredep', ['bower'], function () {
  var wiredep = require('wiredep').stream;
  gulp.src('src/*.html')
      .pipe(wiredep({
          bowerJson: require('./bower.json')
      }))
      .pipe(gulp.dest('src'));
});

gulp.task('html', ['partials'], function () {
  var assets = $.useref.assets({searchPath: ['.tmp','src', '.']});

  return gulp.src('src/*.html')
      .pipe(assets)
      .pipe($.sourcemaps.init({loadMaps: true}))
      .pipe($.if('*.js', $.ngAnnotate()))
      .pipe($.if('*.js', $.uglify()))
      .pipe($.if('*.js', $.iife()))
      .pipe($.sourcemaps.write('./'))
      .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
      .pipe(assets.restore())
      .pipe($.useref())
      .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
      .pipe(gulp.dest('dist'));
});

gulp.task('partials', function() {
    gulp.src('src/partials/**/*.html')
        .pipe(templateCache("scripts/templates.js", {module: "webapp", root: "partials/"}))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['bower', 'wiredep', 'partials', 'html']);

gulp.task('test', ['bower'], function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('clean', function() {
	return del([folder], {force:true});
});