var gulp = require('gulp');

gulp.task('s3-upload', shell.task([
    'node s3-upload.js'
]));
