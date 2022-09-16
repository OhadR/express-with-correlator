import * as express from 'express';
import { Service } from "./service";
import * as correlator from 'correlation-id';
require('./log-config');

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
        const correlatorId = Math.floor(Math.random() * 100000);
        correlator.withId(correlatorId, async () => {
            logger.info(`received 'run' request`);

            //extract data from request, etc...

            const result = await new Service().doSomething();

            logger.info(`result: ${result}`);
            res.status(200).send({ result });
        });

    } catch (e) {
        logger.error(`Error: ${JSON.stringify(e.stack)}`, e.message);
        res.status(500).send(e);
    }
});

app.post('/exit/', async (req: express.Request, res: express.Response) => {
    try {
        logger.info(`received 'exit' request`);

        process.exit(1);
        res.status(200).send(0);


    } catch (e) {
        logger.error(`Error: ${JSON.stringify(e.stack)}`, e.message);
        res.status(500).send(e);
    }
});

process.on('beforeExit', (code) => {
    console.log('Process beforeExit event with code: ', code);
});

process.on('exit', (code) => {
    console.log('Process exit event with code: ', code);
});

