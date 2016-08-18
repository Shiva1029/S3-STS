var gulp = require('gulp');

gulp.task('recursive-upload', shell.task([
    'node recursive-upload.js'
]));
