"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");
var server = require("browser-sync").create();
var run = require("run-sequence");
var build = "docs";

gulp.task("style", function() {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest(build + "/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest(build +"/css"))
    .pipe(server.stream());
});

gulp.task("js", function() {
  return gulp.src("js/**/*.js")
    .pipe(uglify())
    .pipe(gulp.dest(build + "/js"));
});

gulp.task("images", function () {
  return gulp.src("img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest(build + "/img"));
});

gulp.task("sprite", function () {
  return gulp.src("img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest(build + "/img"));
});

gulp.task("html", function () {
  return gulp.src("*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest(build));
});

gulp.task("copy", function () {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "js/**"
  ], {
    base: "."
  })
  .pipe(gulp.dest(build));
});

gulp.task("clean", function () {
  return del(build);
});

gulp.task("serve", function() {
  server.init({
    server: build + "/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"])
    .on('change', server.reload);
  gulp.watch("js/**/*.js", ["js"])
    .on('change', server.reload);
  gulp.watch("*.html", ["html"])
    .on('change', server.reload);
});

gulp.task("build", function (done) {
  run("clean", "copy", "style", "js", "sprite", "html", done);
});