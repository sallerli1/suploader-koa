let fse = require("fs-extra");
let path = require("path");
let multer = require("koa-multer");

function createMulter (dir) {
    let storage = multer.diskStorage({
    destination: async function(req, file, cb) {
        let params = req.body,
            storage = path.resolve(
                dir,
                `${params.file_size}-${params.file_name}`
            );

        if (!(await fse.exists(storage))) {
            await fse.mkdir(storage);
        }

        cb(null, storage);
    },

    filename: function(req, file, cb) {
            cb(null, `${req.body.number}-${req.body.file_name}`);
        }
    });

    return multer({storage});
}



module.exports = createMulter;