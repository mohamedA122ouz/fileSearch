import fs from "fs";
// import path from "path";
// import {fileURLToPath} from "url";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
function merge(newPath, oldPath, mergePath) {
    let oldFile = JSON.parse(fs.readFileSync(oldPath), "utf8");
    let newFile = JSON.parse(fs.readFileSync(newPath), "utf8");
    for (let f in newFile) {
        oldFile[f] = newFile[f];
    }
    fs.writeFileSync(mergePath, JSON.stringify(oldFile));
    if (JSON.stringify(newFile) !== "{}")
        fs.writeFileSync(newPath, '{"merge finished:":true}');
    else
        fs.writeFileSync(newPath, '{"merge finished:":false,"reason":"emptyFile"}');
}
export default merge;