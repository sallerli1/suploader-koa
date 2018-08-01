let path = require('path');
let fse = require('fs-extra');

async function cancatFiles(dir, filename, filesize, cnt) {
    let filePath = path.resolve(
        dir,
        `${filesize}-${filename}`
    );
    let tempFilePath = path.resolve(
        dir,
        filename
    );
    for (let i = 0; i < cnt; i++) {
        let currentPath = path.resolve(
            dir,
            `${filesize}-${filename}`,
            `${i}-${filename}`
        );
        await fse.appendFile(
            tempFilePath,
            await fse.readFile(currentPath)
        );

        await fse.remove(currentPath);
    }

    await fse.remove(filePath);
    await fse.move(tempFilePath, filePath);
}

module.exports = cancatFiles;