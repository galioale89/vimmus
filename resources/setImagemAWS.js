const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3")
const { fromIni } = require("@aws-sdk/credential-provider-ini")

var setImageInAWS = async function (fileName, newName) {
    const s3Config = {
        region: 'sa-east-1',
        credentials: fromIni({ profile: 'vimmusimg' })
    };
    const file = fileName
    const putData = {
        Bucket: 'vimmusimg', //process.env.IMAGES_BUCKET
        Key: newName,
        StorageClass: 'STANDARD',
        Body: file
    };
    const s3Client = new S3Client(s3Config);
    console.log('EnviandoImagem')
    let response = await s3Client.send(new PutObjectCommand(putData));
    console.log('awsResponse: ', response);
    return response;
}
module.exports = setImageInAWS
