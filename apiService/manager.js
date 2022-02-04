const Express = require('express');
const server = Express();
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { readFileSync, createWriteStream } = require('fs');
const { fromIni } = require("@aws-sdk/credential-provider-ini");
const formidable = require('formidable')
var im = require('imagemagick');

class mobileService {
    constructor(mongoose, app) {
        this.app = app;
        console.log('process.env.PORT: ', process.env.PORT);
        //server.listen(21180, () => { console.log('Ready in 21180') })
        this.mongoose = mongoose;
    }

    run() {
        this.sendTeams();
        this.getImagesTeam();
    }

    async sendTeams() {
        const teamsDb = this.mongoose.model('equipe');
        const proposalDb = this.mongoose.model('proposta');
        this.app.get('/teamsData', async (req, res) => {
            let teams = await teamsDb.find({
                feito: true,
                nome_projeto: { $gt: '' }
            });
            let responseObject = [];
            for (const team of teams) {
                let parsedTeam = { team: [], proposal: [] };
                const proposal = await proposalDb.find({
                    equipe: team._id
                });
                parsedTeam.team = team;
                parsedTeam.proposal = proposal;
                //console.log('proposal: ', proposal)
                responseObject.push(parsedTeam);
            }
            //console.log('responseObject: ', responseObject);
            res.send(responseObject);
        });
    }

    getImagesTeam() {
        this.app.post('/teamImages', (req, res) => {
            const form = formidable({ multiples: true, uploadDir: './uploads' });
            form.parse(req, async (err, fields, files) => {
                res.end('OK');
                const fieldData = JSON.parse(fields.json);
                //console.log('fieldData: ', fieldData);
                const proposeId = fieldData.proposeId;
                const filename = files.image.newFilename;
                const originalName = files.image.originalFilename;
                const postedNameFile = `${originalName}-${filename}.jpg`;
                const response = await this.setImageInAWS(filename, postedNameFile);
                if ((response && !response.hasOwnProperty('$metadata'))
                    || response['$metadata'].httpStatusCode !== 200) {
                    res.end('NOK');
                    console.error('Não foi possível enviar documento ao Bucket S3');
                }
                console.log(`Enviado: ${postedNameFile}`);
                // lembrar de alterar no app atvInfAterramento
                const modelsName = ['atvTelhado', 'atvInversor', 'atvInfAterramento'];
                let model = '';
                modelsName.forEach((name) => {
                    //console.log('name', name);
                    //console.log('name.includes(originalName.substring(0, 6))', name.toLowerCase().includes(originalName.substring(0, 6)));
                    if (name.toLowerCase().includes(originalName.substring(0, 6))) model = name;
                });
                if (model.includes('atvInfAterramento')) model = 'atvAterramento';
                //console.log('model: ', model);
                const imageDate = new Date(Number(originalName.match(/\d{1,}/)[0])).toLocaleString();
                //console.log('imageDate: ', imageDate);
                const DbImage = {
                    desc: postedNameFile,
                    seq: `${model} - ${imageDate} - ${filename}`,
                }
                console.log();
                const Activity = this.mongoose.model(model);
                const activity = await Activity.findOneAndUpdate(
                    {
                        proposta: proposeId
                    },
                    {
                        $push: { caminhoFoto: DbImage }
                    }
                );
                console.log('activity', JSON.stringify(activity));
            });
        });
    }

    async setImageInAWS(fileName, newName) {
        const s3Config = {
            region: 'sa-east-1',
            credentials: fromIni({ profile: 'vimmusimg' })
        };
        const file = readFileSync(`./uploads/${fileName}`);
        // const file
        // im.resize({
        //     srcData: fs.readFileSync(`./uploads/${fileName}`, 'binary'),
        //     width: 256
        // }, function (err, stdout, stderr) {
        //     if (err) throw err
        //     file = fs.writeFileSync(`./uploads/${fileName}`, stdout, 'binary');
        //     console.log('resized kittens.jpg to fit within 256x256px')
        // });

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
}

module.exports = mobileService;