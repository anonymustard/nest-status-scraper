const AWS = require('aws-sdk');

const bucketName = process.env.BUCKET_NAME;
const objectName = process.env.OBJECT_NAME;

const uploadStatusToS3 = (status) => {
    const s3 = new AWS.S3();
    console.log(`Uploading status "${status}" to ${bucketName}/${objectName}`)
    return s3.putObject({
        ACL: 'public-read',
        Bucket: bucketName,
        Key: objectName,
        StorageClass: 'STANDARD',
        Body: status + '\n'
    }).promise()
    .then(() => {
        console.log('Done');
    })
    .catch((err) => {
        console.log(`Error ${err.message}`);
    });
}

module.exports = {
    uploadStatusToS3
};
