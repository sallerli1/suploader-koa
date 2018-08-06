let { isType, isPlainObject } = require('../util/type');
let createMulter = require("./storage");
let cancatFiles = require('./cancat');

let Router = require("koa-router");
let path = require('path');
let fse = require('fs-extra');

function createCb(options) {
    options.custom = isType(Function, options.custom) ?
        options.custom :
        function () {};

    return async function(ctx) {
        let info,
            params = ctx.req.body,
            file = ctx.req.file,
            ack = -1;

        let finished = false;
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

            info.last === info.chuckCount && (finished = true)
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

        options.saveInfo(
            params.file_name, 
            params.file_size,
            info
        );

        if (ack >= info.chuckCount - 1 && !finished) {
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

        ctx.body = {
            ack,
            path: path.resolve(
                options.dir,
                `${params.file_size}-${params.file_name}`
            )
        };
    };
}

function createRouter(options) {
    let router = new Router();

    let multer = createMulter(options.dir);
    let cb = createCb(options);

    router.post(options.api, multer.single('file'), cb);
    return router
}

module.exports = createRouter;
