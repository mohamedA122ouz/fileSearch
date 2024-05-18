import fs from 'fs';
import { isMainThread, workerData, parentPort } from "worker_threads";
const noFilter = "!@#$%^&*";
let object = {};
let filter=noFilter;
if(!isMainThread)
filter = workerData.filter;
const time = Date.now();
async function listDir(path) {
    try {
        return await fs.promises.readdir(path);
    } catch (error) {
        // console.log(path, Error("NOT ALLOWED TO CHECK"));
        return [];
    }
}
async function codeController(path) {
    object[path] = await listDir(path);
    runIndexing(path);
}

async function runIndexing(path) {
    let array = object[path] ? [...object[path]] : [];
    array.forEach(async (element) => {
        if (!filter.includes(element) || filter == noFilter) {
            try {
                if (fs.statSync(`${path}/${element}`).isDirectory()) {
                    object[`${path}/${element}`] = await listDir(`${path}/${element}`);
                    runIndexing(`${path}/${element}`);
                }
            }
            catch (error) {
                if (!element.includes(".")) {
                    object[`${path}/${element}`] = await listDir(`${path}/${element}`);
                    runIndexing(`${path}/${element}`);
                }
            }
        }
    });
}
function main(path, saveplace) {
    codeController(path);
    process.on("exit", () => {
        // console.log(saveplace);
        if (saveplace) {
            console.log("Started indexing (please don't close this window)");
            let timer = new Date(Date.now() - time);
            let datetime = timer.toUTCString(); // get the date and time string in UTC
            let timer2 = datetime.slice(-12, -4);
            console.log("time taken in seconds:", `${timer2}`);
            fs.writeFileSync(saveplace, JSON.stringify(object));
            try {
                let data = fs.readFileSync("./logIndexing.txt", "utf8");
                data += "\n" + "time consumed: " + timer2;
                fs.writeFileSync("./logIndexing.txt", data);
            }
            catch {
                fs.writeFileSync("./logIndexing.txt", "time consumed: " + timer2);
            }
        }
        else {
            parentPort.postMessage(object);
        }
    })
}
if (isMainThread)
    main("E:/", "./memory/E.json");
else {
    main(workerData.scanPlace, isMainThread);
}
export default listDir;
