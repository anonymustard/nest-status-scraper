const AWS = require('aws-sdk');

const email = process.env.NEST_EMAIL;
const password = process.env.NEST_PASSWORD;

const getNestStatus = async () => {
    const puppeteer = require('puppeteer-lambda');

    const browser = await puppeteer.getBrowser({headless:true});
    const page = await browser.newPage();
    await page.goto('https://home.nest.com/', {waitUntil: 'networkidle2'});
    const loginEmailXpath ='//*[@id="email"]';
    await page.waitForXPath(loginEmailXpath);
    await page.type('#email', email);
    await page.type('#pass', password);
    await page.click('#signin', {waitUntil: 'networkidle2'});
    await page.waitForNavigation();
    const thermostatLinks = await page.$x("//a[contains(@href,'thermostat')]//h2[@class='puck-status-text']");
    //const thermostatLinks = await page.$x("//a//h2[@class='puck-status-text']");
    // let text = await page.evaluate(h2=>h2.innerHTML, thermostatLinks[0]);
    // console.log(`"${text}"`);
    // text = await page.evaluate(h2=>h2.innerHTML, thermostatLinks[1]);
    // console.log(`"${text}"`);
    const xpathTextContent = await thermostatLinks[0].getProperty('textContent');
    const text = await xpathTextContent.jsonValue() || 'OK';

    await browser.close();
    console.log(`Got status "${text}"`);

    return text;
};

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
    }).promise();
}

getNestStatus()
    .then((status) => uploadStatusToS3(status));
