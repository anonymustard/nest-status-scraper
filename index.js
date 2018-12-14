const s3 = require('./s3');
const nest = require('./nest')

nest.getNestStatus()
    .then((status) => s3.uploadStatusToS3(status));
