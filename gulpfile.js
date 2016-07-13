"use strict";

var gulp = require("gulp");
var rename = require("gulp-rename");
var plumber = require("gulp-plumber");
var stylus = require("gulp-stylus");
var minify = require("gulp-csso");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var imagemin = require("gulp-imagemin");
var server = require("browser-sync");
var run = require("run-sequence");
var del = require("del");
var jade = require("gulp-jade");

gulp.task("build", function(fn) {
  run(
    "clean",
    "copy",
    "html",
    "style",
    "images",
    "symbols",
    fn
  );
});

gulp.task("html", function() {
  gulp.src("jade/index.jade")
  .pipe(plumber())
  .pipe(jade())
  .pipe(gulp.dest("."))
  .pipe(server.reload({stream: true}));
})

gulp.task("style", function() {
  gulp.src("stylus/style.styl")
    .pipe(plumber())
    .pipe(stylus())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 1 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions"
      ]}),
      mqpacker({
        sort: false
      })
    ]))
    .pipe(gulp.dest("css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("css"))
    .pipe(server.reload({stream: true}));
});

gulp.task("images", function() {
  return gulp.src("dist/img/**/*.{png,jpg,gif}")
  .pipe(imagemin([
    imagemin.optipng({
      optimizationLevel: 3
    }),
    imagemin.jpegtran({
      progressive: true
    })
  ]))
  .pipe(gulp.dest("dist/img"));
});

gulp.task("symbols", function() {
  return gulp.src("dist/img/icons/*.svg")
  	.pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("dist/img"));
});

gulp.task("serve", function() {
	server.init({
		server: ".",
		notify: false,
		open: true,
		ui: false
	});

  gulp.watch("stylus/**/*.styl", ["style"]);
  gulp.watch("jade/**/*.jade", ["html"]);
  gulp.watch("*.html").on("change", server.reload);
});

gulp.task("copy", function() {
	return gulp.src([
		"fonts/**/*.{woff,woff2}",
		"img/**",
		"js/**",
		"*.html"
	], {
		base: "."
	})
	.pipe(gulp.dest("dist"))
});

gulp.task("clean", function() {
  return del("dist");
});
