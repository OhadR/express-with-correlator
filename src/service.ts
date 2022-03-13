const logger = require('log4js').getLogger();
logger.level = 'info';
logger.category = 'service';

const debug = require('debug')('authentication-flows-processor');

export class Service {

    private static _instance: Service;


    private constructor() {
    }

    public static get instance() {
        return this._instance || (this._instance = new this());
    }


    async doSomething(speed: number, radius: number) {
        
    }
}