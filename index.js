var AWS = require('aws-sdk');

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

sts.assumeRole(params, function (err, data) {
    if (err) {
        console.log(err, err.stack);
    } else {
        credentials = data.Credentials;

        var s3 = new AWS.S3({
            accessKeyId: credentials.AccessKeyId,
            secretAccessKey: credentials.SecretAccessKey,
            sessionToken: credentials.SessionToken,
            region: '<>'
        });

        var parameters = {Bucket: '<NAME>', Key: 'key', Body: 'Hello World Test!'};

        s3.putObject(parameters, function (err, data) {
            if (err)
                console.log(err)
            else       console.log("Successfully uploaded data to <NAME>/key");
        });

    }
});
