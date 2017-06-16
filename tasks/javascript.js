'use strict';

var config = require('../config');
var gulp = require('gulp');
var path = require('path');
var tap = require('gulp-tap');
var readJson = require('read-package-json')

var buildAmd = require('metal-tools-build-amd/lib/pipelines/buildAmd');

gulp.task('build-javascript', [], function(done) {
	console.log('[JavaScript] Copying files...');

	var moduleName = '';
	var moduleVersion = '';

	readJson(path.join(process.cwd(), 'package.json'), console.error, false, function (er, data) {
		if (er) {
			console.error("There was an error reading package.json")
			return
		}

		moduleName = data.name;
		moduleVersion = data.version;
	});

	gulp.src([config.globJs, '!src/**/*.soy.js'])
	.pipe(buildAmd({moduleName: ''}))
	.pipe(tap(function(file) {
		file.path = file.path.replace('META-INF/resources/src/main/resources/META-INF', 'META-INF');

		var resourcesPath = path.relative(
			process.cwd(),
			file.path.replace('src/main/resources/META-INF/resources', '').replace('.js', '')
		);

		file.contents = new Buffer(String(file.contents)
			.replace(/define\(\[/g, 'Liferay.Loader.define("' + moduleName + '@' + moduleVersion + '/' + resourcesPath + '", [')
		);
	}))
	.pipe(gulp.dest(path.join(config.pathExploded, 'META-INF/resources')))
	.on('end', function() {
		console.log('[JavaScript] Done.');
		done();
	});
});