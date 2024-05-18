import fs from 'fs';
import { Worker, isMainThread, threadId, workerData } from "worker_threads";
import { codeController, editKeyThenRunIndexing } from './indexing2.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const noFilter = "!@#$%^&*";
let workerThreadPath = "./";
let startPoint = {};
let doneEarly = false;
/** 
 * @param {string} filter ignored folder
**/
let filter;
let counter = { total: 0, done: 0 };
let time = Date.now();
const createdThreads = {
    notRealThread: { terminate: () => { } },
    length: 0,
    threads: {},
    push: function (thread) {
        this.threads[this.length++] = thread;
    },
    remove: function (id) {
        this.threads[id] = this.notRealThread;
    },
    forEach: function (callback) {
        for (let i in this.threads) {
            callback(this.threads[i], +i);
        }
    },
    makeEmpty: function () {
        this.threads = {};
    }
};
const detailPlaceOnFound = { file: "" };
const key = { string: "copyright.txt" };
const threadPath = path.resolve("./indexing2.js");
let interval = null;
console.log(threadPath);
/** 
@param {object} dataToWait detailPlaceOnFound
@param {string} scanParam if it is scanning only
**/
const wait = (dataToWait, scanParam) => {
    return new Promise((fulfil, faild) => {
        let timer = setInterval(() => {
            if (dataToWait.file) {
                clearInterval(timer);
                fulfil(dataToWait);
            }
            else if (dataToWait.file === null && scanParam === "q:scan") {
                dataToWait.file = "";
                clearInterval(timer);
                fulfil(dataToWait);
            }
            else if (dataToWait.file === null) {
                clearInterval(timer);
                faild("Not found");
            }
        }, 150);
    });
}

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
        let worker = new Worker(path.join(__dirname,"./indexing2.js"), { workerData: { id: createdThreads.length, key: key.string, scanPlace: `${childPath}`, filter: filter } });
        createdThreads.push(worker);
        worker.on("message", (msg) => {
            startPoint = { ...startPoint, ...msg.startPoint };
            createdThreads.remove(msg.id);
            if (msg.found) {
                createdThreads.forEach(el => {
                    el.terminate();
                });
                doneEarly = true;
                detailPlaceOnFound.file = msg.place;
            }
            else
                console.log("Done: ", (((++counter.done) / counter.total) * 100).toFixed(0) + "%");
            if (counter.done / counter.total === 1 && !detailPlaceOnFound.file) {
                detailPlaceOnFound.file = null;
            }
        });
    }
}
function saveObject(saveplace) {
    let timer = new Date(Date.now() - time);
    let datetime = timer.toUTCString(); // get the date and time string in UTC
    let timer2 = datetime.slice(-12, -4);
    if (doneEarly)
        console.log("Done: ", "100%");
    console.log("time consumed using MultiThread: ", `${timer2}`);
    console.log("saved!!");
    fs.writeFileSync(saveplace, JSON.stringify(startPoint));
    try {
        let data = fs.readFileSync("./logIndexing.txt", "utf8");
        data += "\n" + "time consumed using MultiThread: " + timer2;
        fs.writeFileSync("./logIndexing.txt", data);
    }
    catch {
        fs.writeFileSync(path.join(__dirname,"./logIndexing.txt"), "time consumed using MultiThread: " + timer2);
    }
}

async function main(path, saveplace, func) {
    await codeController(path, startPoint, startMThread);
    console.log("Started indexing (please don't close this window)");
    process.on("exit", () => {
        saveObject(saveplace);
        if (func !== undefined) {
            func();
        }
    });
}
/**
 * @param {string} startIndexingAt start indexing like `E:/` don't write it `E://` will make Errors
 * @param {string} memoryFile  the json file which save indexed data `./memory/E.json`
 * @param {string} ignore if you don't want to include some folder while scanning for example `Windows`
 * @param {string} keyVal wanted file name
 * @param {callback} func callback to the search if exist
**/
async function Main2(startIndexingAt, memoryFile, keyVal, func, ignore) {
    try {

        time = Date.now();
        key.string = keyVal;
        if (ignore)
            filter = ignore;
        else { filter = noFilter; }
        main(startIndexingAt, memoryFile, func);
        let waitedData = await wait(detailPlaceOnFound, keyVal);
        console.log(waitedData);
        waitedData = { path: [waitedData.file], parentPath: [waitedData.file.slice(0, waitedData.file.lastIndexOf("/"))] };
        saveObject(memoryFile);
        detailPlaceOnFound.file = "";
        console.log(counter.done);
        counter.done = 0;
        console.log(counter.done);
        counter.total = 0;
        createdThreads.makeEmpty();
        return waitedData;
    }
    catch (e) {
        console.log(Error(e));
        saveObject(memoryFile);
        detailPlaceOnFound.file = "";
        console.log(counter.done);
        counter.done = 0;
        console.log(counter.done);
        counter.total = 0;
        createdThreads.makeEmpty();
        return { path: "", parentPath: "" };
    }
}
export default Main2;
export {counter};