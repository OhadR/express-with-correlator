import * as correlator from 'correlation-id';
import { configure, getLogger, addLayout } from "log4js";

//
//this was we use the 'old' appender for regular logs, and a new json_appender for json logs. note how we write the correlatorId
//

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
        json_appender: { type: 'stdout', layout: {
                type: 'json',
                separator: ",",
            }}
    },
    categories: { default: { appenders: ['out', 'json_appender'], level: 'info' }
        }
});

getLogger('log-config').info('logger is configured.');