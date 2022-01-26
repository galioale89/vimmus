const Express = require('express');
const server = Express();

class mobileService {
    constructor() {
        console.log('process.env.PORT: ', process.env.PORT);
        server.listen(21180, () => { console.log('Ready in 21180') })
    }

    async getTeams(mongoose) {
        const teamsDb = mongoose.model('equipe');
        const proposalDb = mongoose.model('proposta');
        server.get('/teamsData', async (req, res) => {
            let teams = await teamsDb.find({
                /* feito: true,
                liberar: true,
                prjfeito: false */
            });
            let responseObject = [];
            const parsedTeams = [...teams];
            let proposals = [];
            for (const team of teams) {
                let parsedTeam = { team: [], proposal: [] };
                const proposal = await proposalDb.find({
                    equipe: team._id 
                });
                parsedTeam.team = team;
                parsedTeam.proposal = proposal;
                console.log('proposal: ', proposal)
                responseObject.push(parsedTeam);
            }
            console.log('responseObject: ', responseObject);
            res.send(responseObject);
        });
    }
}

module.exports = new mobileService();