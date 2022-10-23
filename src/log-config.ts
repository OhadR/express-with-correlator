import * as correlator from 'correlation-id';
import { configure, getLogger, addLayout } from "log4js";

addLayout("json", function (config) {
    return function (logEvent) {
        logEvent["sessionId"] = correlator.getId();
        return JSON.stringify(logEvent);
    };
});

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
            }},
        out2: { type: 'stdout', layout: {
                type: 'json',
                separator: ",",
                //pattern: '{%[[%d] [%p] %c [%x{user}]%] %m}',
                tokens: {
                    user: function (logEvent) {
                        return correlator.getId();
                    }
                }
            }}
    },
    categories: { default: { appenders: ['out', 'out2'], level: 'info' }
        }
});

getLogger('log-config').info({m: 'logger is configured.'});