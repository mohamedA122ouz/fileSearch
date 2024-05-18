import fs from 'fs';
import { Worker, isMainThread, workerData } from "worker_threads";
import { codeController, runIndexing } from './indexing.js';
const noFilter = "!@#$%^&*";
let workerThreadPath = "./";
let startPoint = {};
/** 
 * @param {string} filter ignored folder
**/
let filter;
let counter = { total: 0, done: 0 };
const time = Date.now();

function startMThread(path) {
    runIndexing(path,threadSetup,startPoint);
}
function threadSetup(childPath) {
    counter.total++;
    new Worker(workerThreadPath + "indexing.js", { workerData: { scanPlace: `${childPath}`, filter: filter } }).on("message", (msg) => {
        startPoint = { ...startPoint, ...msg };
        console.log("Done: ", (((++counter.done) / counter.total) * 100).toFixed(0) + "%");
    });
}

async function main(path, saveplace, func) {
    await codeController(path, startPoint, startMThread);
    console.log("Started indexing (please don't close this window)");
    process.on("exit", () => {
        let timer = new Date(Date.now() - time);
        let datetime = timer.toUTCString(); // get the date and time string in UTC
        let timer2 = datetime.slice(-12, -4);
        console.log("time consumed using MultiThread: ", `${timer2}`);
        fs.writeFileSync(saveplace, JSON.stringify(startPoint));
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
