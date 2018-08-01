let { isType, isPlainObject } = require('../util/type');
let createMulter = require("./storage");
let cancatFiles = require('./cancat');

let Router = require("koa-router");

function createCb(options) {
    return async function(ctx) {
        let info,
            params = ctx.req.body,
            file = ctx.req.file,
            ack = -1;

        let number = parseInt(params.number);

        info = await options.readInfo(
            params.file_name, 
            params.file_size
        );

        if (!info) {
            info = {
                last: -1,
                buffer: [],
                fileName: "",
                fileSize: 0,
                chuckSize: 0,
                chuckCount: 0
            };
        }

        if (params["first"] || params["number"] < 0) {
            info.fileName = params.file_name;
            info.fileSize = params.file_size;
            info.chuckSize = params.chuck_size;
            info.chuckCount = Math.ceil(info.fileSize / info.chuckSize);
        }

        if (number !== info.last + 1) {
            ack = info.last;
            number > info.last &&
                info.buffer.indexOf(number) < 0 &&
                info.buffer.push(number);
        } else {
            ack = ++info.last;
            while (info.buffer.length) {
                if (info.buffer[0] === ack + 1) {
                    ack = ++ info.last;
                    info.buffer.shift();
                } else {
                    break;
                }  
            }
        }

        options.saveInfo(info);

        if (ack >= info.chuckCount - 1) {
            cancatFiles(
                options.dir, 
                params.file_name, 
                params.file_size, 
                info.chuckCount
            );
        }

        let customParams = await options.custom(info);
        if (isPlainObject(customParams)) {
            for (const key of Object.keys(customParams)) {
                ctx.body[key] = customParams[key]
            }
        }

        ctx.body.ack = ack;
    };
}

function createRouter(options) {
    let router = new Router();

    let multer = createMulter(options.dir);
    let cb = createCb(options);

    router.post(options.api, multer, cb);
    return router
}

module.exports = createRouter;
