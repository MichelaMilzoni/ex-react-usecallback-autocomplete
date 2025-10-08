import express from 'express';
import fs from 'fs';
import path from 'path';

const resourceRouter = express.Router();

function getResource(resourceName){
    const filePath = path.join(process.cwd(), 'database', `${resourceName}.json`);
    if (!fs.existsSync(filePath)) {
        throw {
            status: 404,
            message: `Risorsa "${resourceName}" non trovata.`,
        }
    }
    try{
        const data = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(data);
        return jsonData;
    }catch{error}{
        throw {
            status: 500,
            message: `Errore nella lettura della risorsa "${resourceName}".`,
        }
    }
}

resourceRouter.get('/:resourceName', async (req, res) => {
    const { resourceName } = req.params;
    const search = req.query.search?.trim();
    const resource = getResource(resourceName);
    if(!search){
        return res.send(resource);
    }
    const filteredResource = resource.filter(item => {
        if(item.name){
            return item.name.toLowerCase().includes(search.toLowerCase());
        }else if(item.title){
            return (
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.author?.toLowerCase().includes(search.toLowerCase())
            );
        }
        return false;
    });
    res.send(filteredResource);
});

resourceRouter.get('/:resourceName/:id', async (req, res) => {
    const { resourceName, id } = req.params;
    const resource = getResource(resourceName);
    const resourceItem = resource.find(item => parseInt(item.id) === parseInt(id));
    if (!resourceItem) {
        throw {
            status: 404,
            message: `Risorsa "${resourceName}" con id ${id} non trovata.`,
        }
    }
    res.send(resourceItem);
});

export default resourceRouter;