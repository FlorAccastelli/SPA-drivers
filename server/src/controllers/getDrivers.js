const axios = require('axios');
const defaultImage = {url: 'https://e00-marca.uecdn.es/assets/multimedia/imagenes/2024/03/08/17099126193794.jpg'};
const { Driver } = require('../db');

const getDrivers = async (req, res) => {
    try {
        let url;
        let queryCondition = {raw: true};
        let queryByName = false;
        if (req.query.name) {
            let nameByQuery = req.query.name.toLowerCase()
            nameByQuery = nameByQuery[0].toUpperCase() + nameByQuery.slice(1);

            url = `http://localhost:5000/drivers?name.forename=${nameByQuery}`;
            queryCondition = { where: {name: nameByQuery}, raw: true, limit: 15}
            queryByName = true;
        } else {
            url = 'http://localhost:5000/drivers';

        }
        
        const response  = await axios.get(url);

        const driversDB = (await Driver.findAll(queryCondition)).map((driver) => {
            return ({
            id: driver.id, 
            name: {forename:driver.name, 
                    surname: driver.surname},
            image: {url: driver.image},
            dob: driver.dob,
            nationality: driver.nationality,
            teams: driver.teams,
            description: driver.description,
            origin: "fromDB"
            })
        })
        
            const driversAPI = response.data.map(({ id, name, image, dob, nationality, teams, description }) => ({
                id,
                name,
                image: (image && image.url) ? image : defaultImage,
                dob,
                nationality,
                teams,
                description,
                origin: "fromAPI"
            }));

            
            console.log(driversAPI)
            let result = [];
            if(queryByName) {
                result = [...driversDB, ...driversAPI].slice(0, 15);
                if (!result || result.length === 0) {
                    return res.status(200).json([]) //dsps corregir
                }
            } else {
                result = [...driversDB, ...driversAPI];
            }
            return res.status(200).json(result);

    }catch(error){
        res.status(500).send(error.message);
    }
}

module.exports = getDrivers;


