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

    async sleep(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    async doSomething() : Promise<number> {
        const rand = Math.ceil(Math.random() * 6);
        logger.info(`doSomething()`, rand);
        let retVal;
        if(rand % 2 === 0)
            retVal = await this.foo1();
        else
            retVal = await this.foo2();
        return retVal;
    }

    async foo1() {
        const rand = Math.ceil(Math.random() * 6);
        logger.info(`foo1()`, rand);
        let retVal;
        if(rand % 2 === 0)
            retVal = await this.bar1();
        else
            retVal = await this.bar2();
        return retVal + rand;
    }

    async foo2() {
        const rand = Math.ceil(Math.random() * 6);
        logger.info(`foo2()`, rand);
        let retVal;
        if(rand % 2 === 0)
            retVal = await this.bar1();
        else
            retVal = await this.bar2();
        return retVal + rand;
    }

    private async bar1() {
        const rand = Math.ceil(Math.random() * 6);
        logger.info(`bar1()`, rand);
        await this.sleep(rand);
        return rand;
    }

    private async bar2() {
        const rand = Math.ceil(Math.random() * 6);
        logger.info(`bar2()`, rand);
        await this.sleep(rand);
        return rand;
    }
}