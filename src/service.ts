import * as correlator from 'correlation-id';
import * as log4js from "log4js";

log4js.configure({
    appenders: {
        out: { type: 'stdout', layout: {
                type: 'pattern',
                pattern: '%[[%d] [%p] %c [%x{user}]%] %m',
                tokens: {
                    user: function (logEvent) {
                        return correlator.getId();
                    }
                }
            }}
    },
    categories: { default: { appenders: ['out'], level: 'info' } }
});
const logger = log4js.getLogger();


export class Service {

    async sleep(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    async doSomething() : Promise<number> {
        const rand = Math.ceil(Math.random() * 6);
        logger.info(`doSomething(): method takes ${rand} secs`);
        await this.sleep(rand);
        const retVal = (rand % 2 === 0) ? await this.foo1() : await this.foo2();
        logger.info(`doSomething(): result: ${retVal}.`);
        return retVal;
    }

    async foo1() {
        const rand = Math.ceil(Math.random() * 6);
        logger.info(`foo1(): method takes ${rand} secs`);
        await this.sleep(rand);
        const retVal = (rand % 2 === 0) ? await this.bar1() : await this.bar2();
        return retVal + rand;
    }

    async foo2() {
        const rand = Math.ceil(Math.random() * 6);
        logger.info(`foo2(): method takes ${rand} secs`);
        await this.sleep(rand);
        const retVal = (rand % 2 === 0) ? await this.bar1() : await this.bar2();
        return retVal + rand;
    }

    private async bar1() {
        const rand = Math.ceil(Math.random() * 6);
        logger.info(`bar1(): method takes ${rand} secs`);
        await this.sleep(rand);
        return rand;
    }

    private async bar2() {
        const rand = Math.ceil(Math.random() * 6);
        logger.info(`bar2(): method takes ${rand} secs`);
        await this.sleep(rand);
        return rand;
    }
}