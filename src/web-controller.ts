import * as url from 'url';
import * as express from 'express';
import { Service } from "./service";
const debug = require('debug')('user-action-controller');

const logger = require('log4js').getLogger();
logger.level = 'info';
logger.category = 'web-controller';

let app;


app.post('/run/', async (req: express.Request, res: express.Response) => {
    try {
        logger.info(`received 'run' request: ${JSON.stringify(req.body)}`);
        const { speed, radius } = req.body;

        const result = await Service.instance.doSomething(speed, radius);

        logger.info(`result: ${JSON.stringify(result)}`);
        res.status(200).send(result);

    } catch (e) {
        logger.error(`Error: ${JSON.stringify(e.stack)}`, e.message);
        res.status(500).send(e);
    }
});

