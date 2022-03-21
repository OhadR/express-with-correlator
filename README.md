# express-with-correlator


    ts-node src\web-controller.ts

## the challenge

I was developing a web-server implemented in Node.js, serving lots of clients and dozens of requests per second. From time 
to time we were *trying to* troubleshoot
problems by using the logs. We realized that if we do not maintain a correlator for each request, it is impossible to know which log-line
came from which call/request. Thus, flow could not be inspected and troubleshooting problems was hardly possible.

## demonstration

For simplicity, yet problematic enough to illustrate the challenge, we have the application below. There is a controller 
`/run` that calls the service' entrypoint, `doSomething()` which is 'heavy' and takes time - in this case it sleeps random (1-10) number of seconds.
Then it calls randomly `foo1()` or `foo2()`. Each one of them does similar thing (heavy work - random time of sleep) and calls
randomly to another layer - `bar1()` or `bar2()`. 

![illustration-app](illustration-app-2.JPG)

For this example it is important that every function sleeps random time
because it illustrates real-life flow, where functions take different amount of time and logically call other functions. Thus, it
is very difficult to understand from the logs who called who and what is the stack trace.

For example, if we call 5 - only 5 - parallel calls to `/run`, the result would be:

![without-correlator](logs-without-correlator.JPG)

this is impossible to debug or to analyze issues because we cannot tell which log comes from which run.

## requirements

**The challenge consists of 2 parts**:
* First, indicating all logs from the same request with a unique correlator.
* Second, adding this correlator to every log line without refactoring all the code.

## solution

### correlator

First things first: we will handle the correlator.

In Java, for example, each call to the web-server is handled by a thread, and unless a new thread is created on purpose, the
developer can always query the thread-id by `Thread.currentThread()`, or store some data on the [ThreadLocal](https://docs.oracle.com/javase/7/docs/api/java/lang/ThreadLocal.html).
Need to note that this pattern is relevant [not only for java](https://en.wikipedia.org/wiki/Thread-local_storage).
Alas, node.js works differently and except the event-loop, all logic happens in the same worker thread.

There are several ways to tackle this; I have chosen to use [correlationr-id](https://www.npmjs.com/package/correlation-id)
package:

>Correlation id maintains a consistent id across asynchronous calls in node.js applications. This is extremely useful for 
 logging purposes. For example within an API, each incoming request can be assigned an id that will be available in all 
 function calls made processing that request, so we can see which requests caused errors.

**VERY** important: note its compatibility:

>From v4 onwards this library requires node >=12.17.0. For older node versions use v3.x.

In general this package uses async_hooks, and [here is a nice article explaining it](https://medium.com/the-node-js-collection/async-hooks-in-node-js-illustrated-b7ce1344111f).

The way to integrate this into my express server is this:


    app.get('/run/', async (req: express.Request, res: express.Response) => {
        try {
            const correlatorId = Math.floor(Math.random() * 100000);
            correlator.withId(correlatorId, async () => {
                logger.info(`received 'run' request`);
        
                const result = await new Service().doSomething();
        
                logger.info(`result: ${result}`);
                res.status(200).send({ result });
            });
        
        } catch (e) ...
    });

As we can see, the code remained as is except the fact that we generate a correlation-id (there are many other ways to do this
but I wanted to simplify the example), and then call `correlator.withId()` and let the original code run within the 
correlation scope. correlation-id docs:

![docs-withId](docs-withId.JPG)


### log4js

Now we have the ability to call `correlator.getId()` from anywhere in our code (`foo1()`, `bar1()`, etc...) and get the 
correlator-id and log it. The problem is that we need to change all the log line in order to log it. For example, change:

    logger.info(`foo1(): method takes ${rand} secs`);

into:

    logger.info(`[${correlator.getId()}] foo1(): method takes ${rand} secs`);

This is a big big headache.

Instead, we need to understand log4js a bit better. One of the pillars of log4js is [**appenders**](https://log4js-node.github.io/log4js-node/appenders.html). 
When the logger is configured,
the appender is set. Appender can be console, file, etc. Full explanation of appenders, with list of built-in appenders and
explanation on custom appenders can be found in the [docs](https://log4js-node.github.io/log4js-node/appenders.html). 

Another pillar of log4js is [**layouts**](https://log4js-node.github.io/log4js-node/layouts.html):

>Layouts are functions used by appenders to format log events for output. They take a log event as an argument and return 
a string. Log4js comes with several appenders built-in, and provides ways to create your own if these are not suitable.

Each layout has a type. By default, it is `basic` and "output the timestamp, level, category, followed by the formatted log event data". 

In other words, the following log line:

    [2022-03-15T20:55:30.360] [INFO] [category-name] some message here

is built by a layout function that gets the message - in this case 'some message here' - as a string argument, and return the following
**pattern**: `%[[%d] [%p] %c%] %m%n`. See the layout docs for explanation of pattern format and what is d, p, c and so on. 

Fortunately, log4js lets you *modify* the pattern by using `type=pattern`.
Thus, you can build your log lines any way you want. For example, you can place the log level `%p` in any part
of the log line, wrap it with brackets, or omit it at all. 

Furthermore, you can add user-defined tokens to be used in the 
pattern by using `%x`. It lets you "add dynamic tokens to your log. Tokens are specified in the tokens parameter."

>User-defined tokens can be either a string or a function. Functions will be passed the log event, and should return a string.

Voilà! This is exactly what we need! Remember the `correlator.getId()`? That would be our token!
Thus, we will configure our layout to be:

```
{
    type: 'pattern',
    pattern: '%[[%d] [%p] %c [%x{user}]%] %m',
    tokens: {
        user: function (logEvent) {
            return correlator.getId();
        }
    }
}
```

If we configure our logger, or more precisely our appender, to contain the above layout, each log line will contain the 
relevant correlator without changing or breaking any API. No need to pass it to the logger, no need to wrap the logger, because 
it cannot be more elegant than this: we have a hook in the logger so it - the logger - can read the correlator.

## result

Now we will invoke our application again and see the results of 5 parallel calls:

![with-correlator](logs-with-correlator.JPG)


Source code is available on GitHub: https://github.com/OhadR/express-with-correlator.