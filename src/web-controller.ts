import * as express from 'express';
import { Service } from "./service";
const debug = require('debug')('web-controller');

const logger = require('log4js').getLogger();
logger.level = 'info';
logger.category = 'web-controller';

// ------------------ app ---------------------//
const PORT = 6789;
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, async() => {
    logger.info(`listening on port ${PORT}.`);
});

app.get('/run/', async (req: express.Request, res: express.Response) => {
    try {
        logger.info(`received 'run' request`);
        const { speed, radius } = req.body;

        const result = await new Service().doSomething();

        logger.info(`result: ${result}`);
        res.status(200).send({ result });

    } catch (e) {
        logger.error(`Error: ${JSON.stringify(e.stack)}`, e.message);
        res.status(500).send(e);
    }
});

