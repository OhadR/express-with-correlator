import * as correlator from 'correlation-id';
import { configure, getLogger } from "log4js";

configure({
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

getLogger('log-config').info('logger is configured.');