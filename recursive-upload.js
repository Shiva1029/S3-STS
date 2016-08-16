var AWS = require('aws-sdk');
var fs = require('fs');
var path = require('path');
var process = require("process");

var s3 = {};
var absPath = '<root>/';
var reqDirs = ['<dir1>', '<dir2>', '<dir2>'];

var sts = new AWS.STS({
    accessKeyId: '<>',
    secretAccessKey: '<>',
    region: '<>',
    sslEnabled: true
});

var params = {
    RoleArn: 'arn:aws:iam::<>:role/<>',
    RoleSessionName: '<>'
};

var credentials = {};

var readContents = function (dirname) {
    fs.readdir('./' + absPath + '' + dirname, function (err, files) {
        if (err) {
            console.error("Could not list the directory.", err);
            process.exit(1);
        }
        else {
            files
                .filter(function (file) {
                    return !fs.lstatSync('./' + absPath + '' + dirname + '/' + file).isDirectory();
                })
                .forEach(function (file, index) {
                    fs.readFile('./' + absPath + '' + dirname + '/' + file, function (err, data) {
                        if (err) throw err; // Something went wrong!
                        else {
                            parameters = {Bucket: '<>', Key: dirname + '/' + file, Body: data};
                            s3.putObject(parameters, function (err, data) {
                                if (err) console.log(err);
                                else console.log('Successfully uploaded data to ' + dirname + '/' + file);
                            });
                        }
                    });
                });

            files
                .filter(function (subdir) {
                    return fs.lstatSync('./' + absPath + '' + dirname + '/' + subdir).isDirectory();
                })
                .forEach(function (subdir, index) {
                    readContents(dirname + '/' + subdir);
                });

        }
    });
};

sts.assumeRole(params, function (err, data) {
    if (err) {
        console.log(err, err.stack);
    } else {
        credentials = data.Credentials;

        s3 = new AWS.S3({
            accessKeyId: credentials.AccessKeyId,
            secretAccessKey: credentials.SecretAccessKey,
            sessionToken: credentials.SessionToken,
            region: '<>'
        });

        reqDirs.forEach(function (val) {
            readContents(val);
        });
    }
});
