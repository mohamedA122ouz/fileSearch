import fs from 'fs';
import { Worker, isMainThread, workerData } from "worker_threads";
import { codeController, runIndexing, editKeyThenRunIndexing } from './indexing2.js';
import path from 'path';
const noFilter = "!@#$%^&*";
let workerThreadPath = "./";
let startPoint = {};
let doneEarly = false;
const createdThreads = [];
const detailPlaceOnFound = { file: "" };
const key = { string: "copyright.txt" };
const threadPath = path.resolve("./indexing2.js");
console.log(threadPath);
/** 
 * @param {string} filter ignored folder
**/
let filter;
let counter = { total: 0, done: 0 };
const time = Date.now();

function startMThread(path, found) {
    if (found !== true && !detailPlaceOnFound.file)
        editKeyThenRunIndexing(key.string, path, threadSetup, startPoint);
    else if (found === true && !detailPlaceOnFound.file) {
        detailPlaceOnFound.file = path;
        return found;
    }
}
function threadSetup(childPath, found) {
    if (found) {
        startMThread(childPath, found);
    }
    else {

        counter.total++;
        let worker = new Worker(threadPath, { workerData: { key: key.string, scanPlace: `${childPath}`, filter: filter } });
        createdThreads.push(worker);
        worker.on("message", (msg) => {
            startPoint = { ...startPoint, ...msg.startPoint };
            // createdThreads.splice(msg.num, 1);
            if (msg.found) {
                createdThreads.forEach(el => {
                    el.terminate();
                });
                doneEarly = true;
                detailPlaceOnFound.file = msg.place;
            } else
                console.log("Done: ", (((++counter.done) / counter.total) * 100).toFixed(0) + "%");
        });
    }
}

async function main(path, saveplace, func) {
    await codeController(path, startPoint, startMThread);
    console.log("Started indexing (please don't close this window)");
    process.on("exit", () => {
        let timer = new Date(Date.now() - time);
        let datetime = timer.toUTCString(); // get the date and time string in UTC
        let timer2 = datetime.slice(-12, -4);
        if (doneEarly)
            console.log("Done: ", "100%");
        console.log("time consumed using MultiThread: ", `${timer2}`);
        console.log(detailPlaceOnFound);
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
    });
}
if (isMainThread) {
    filter = noFilter;
    Main2("E:/", "../../../memory/E_breakOnfound.json", "القطامى كاملا");
}
else {
    Main2(workerData.scanPlace, workerData.saveplace);
    workerThreadPath = workerData.threadPath;
}
/**
 * @param {string} startIndexingAt start indexing like `E:/` don't write it `E://` will make Errors
 * @param {string} memoryFile  the json file which save indexed data `./memory/E.json`
 * @param {string} ignore if you don't want to include some folder while scanning for example `Windows`
 * @param {string} keyVal wanted file name
 * @param {callback} func callback to the search if exist
**/
function Main2(startIndexingAt, memoryFile, keyVal, func, ignore) {
    key.string = keyVal;
    if (ignore)
        filter = ignore;
    else { filter = noFilter; }
    main(startIndexingAt, memoryFile, func);
}
export default Main2;