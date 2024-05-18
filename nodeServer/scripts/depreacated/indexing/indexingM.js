import fs from 'fs';
import { Worker, isMainThread, workerData } from "worker_threads";
const noFilter = "!@#$%^&*";
let workerThreadPath = "./";
let object = {};
/** 
 * @param {string} filter ignored folder
**/
let filter;
let counter = { total: 0, done: 0 };
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
        if (!filter.includes(element) || filter === noFilter) {
            try {
                if (fs.statSync(`${path}/${element}`).isDirectory()) {
                    object[`${path}/${element}`] = await listDir(`${path}/${element}`);
                    threadMsg(new Worker(workerThreadPath + "indexing.js", { workerData: { scanPlace: `${path}/${element}`, filter: filter } }));
                }
            }
            catch (error) {
                if (!element.includes(".")) {
                    object[`${path}/${element}`] = await listDir(`${path}/${element}`);
                    threadMsg(new Worker(workerThreadPath + "indexing.js", { workerData: { scanPlace: `${path}/${element}`, filter: filter } }));
                }
            }
        }
    });
}
function threadMsg(thread) {
    counter.total++;
    thread.on("message", (msg) => {
        object = { ...object, ...msg };
        console.log("Done: ", (((++counter.done) / counter.total) * 100).toFixed(0) + "%");
    });
}

function main(path, saveplace, func) {
    codeController(path);
    console.log("Started indexing (please don't close this window)");
    process.on("exit", () => {
        let timer = new Date(Date.now() - time);
        let datetime = timer.toUTCString(); // get the date and time string in UTC
        let timer2 = datetime.slice(-12, -4);
        console.log("time consumed using MultiThread: ", `${timer2}`);
        fs.writeFileSync(saveplace, JSON.stringify(object));
        try {
            let data = fs.readFileSync("./logIndexing.txt", "utf8");
            data += "\n" + "time consumed using MultiThread: " + timer2;
            fs.writeFileSync("./logIndexing.txt", data);
        }
        catch {
            fs.writeFileSync("./logIndexing.txt", "time consumed using MultiThread: " + timer2);
        }
        if (func !== undefined) {
            func();
        }
    })
}
if (isMainThread) {
    filter = noFilter;
    Main2("E:/", "../../memory/E.json");
}
else {
    Main2(workerData.scanPlace, workerData.saveplace);
    workerThreadPath = workerData.threadPath;
}
/**
 * @param {string} startIndexingAt start indexing like `E:/` don't write it `E://` will make Errors
 * @param {string} memoryFile  the json file which save indexed data `./memory/E.json`
 * @param {string} ignore if you don't want to include some folder while scanning for example `Windows`
 * @param {callback} func callback to the search if exist
**/
function Main2(startIndexingAt, memoryFile, func, ignore) {
    if (ignore)
        filter = ignore;
    else { filter = noFilter; }
    main(startIndexingAt, memoryFile, func);
}
