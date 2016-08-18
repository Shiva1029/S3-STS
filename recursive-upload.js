var AWS = require('aws-sdk');
var fs = require('fs');
var path = require('path');
var process = require("process");

var s3 = {};
var filesList = [];
var delArray = [];
var bucketObjectsList = [];
var lastSetRetrieved = false;
var calledSync = false;
var absPath = '< ROOT >/';
var reqDirs = ['< DIRECTORY 1 >', '< DIRECTORY 2 >', '< DIRECTORY 3 >'];
var bucketname = '< NAME OF BUCKET >';

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
                .forEach(function (file) {
                    if (!fs.lstatSync('./' + absPath + '' + dirname + '/' + file).isDirectory()) {
                        fs.readFile('./' + absPath + '' + dirname + '/' + file, function (err, data) {
                            if (err) throw err; // Something went wrong!
                            else {
                                parameters = {Bucket: bucketname, Key: dirname + '/' + file, ACL: 'public-read', Body: data};
                                if (file.search(/.css$/i) > -1) {
                                    parameters.ContentType = 'text/css';
                                }
                                s3.putObject(parameters, function (err, data) {
                                    if (err) console.log(err);
                                    else console.log('Successfully uploaded data to ' + dirname + '/' + file);
                                });
                            }
                        });
                    } else {
                        readContents(dirname + '/' + file);
                    }
                });
        }
    });
};

var retrieveContents = function (keyMarker) {
    params = {Bucket: bucketname};
    if (keyMarker !== null) {
        params.Marker = keyMarker;
        console.log('showing null!');
    }
    s3.listObjects(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            lastSetRetrieved = true;
        } // an error occurred
        else {
            if (!data.IsTruncated) {
                data.Contents.forEach(function (val) {
                    if (bucketObjectsList.indexOf(val.Key) === -1) {
                        bucketObjectsList.push(val.Key);
                    }
                    lastSetRetrieved = true;
                });
            } else {
                console.log("Retrieving over the max limit for single attempt retrieval of objects.");
                data.Contents.forEach(function (val) {
                    if (bucketObjectsList.indexOf(val.Key) === -1) {
                        bucketObjectsList.push(val.Key);
                    }
                });
                retrieveContents(data.Contents[data.Contents.length - 1].Key);
            }
        }
    });
};

var syncFunction = function () {
    if (bucketObjectsList.length > filesList.length) {
        bucketObjectsList.forEach(function (val) {
            if (filesList.indexOf(val) === -1) {
                delArray.push({Key: val});
            }
        });
        if (delArray.length > 0) {
            var params = {
                Bucket: bucketname,
                Delete: {
                    Objects: delArray
                }
            };
            s3.deleteObjects(params, function (err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else console.log(data);           // successful response
            });
        }
    }
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
        reqDirs.forEach(function (dir) {
            readContents(dir);
        });
        retrieveContents(null);
        var intervalVar = setInterval(function () {
            if (lastSetRetrieved && !calledSync) {
                syncFunction();
                calledSync = true;
            } else if (calledSync) {
                clearInterval(intervalVar);
            }
        }, 3000);
    }
});
