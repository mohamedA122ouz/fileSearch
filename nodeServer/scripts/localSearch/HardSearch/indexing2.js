import fs from 'fs';
import { isMainThread, workerData, parentPort } from "worker_threads";
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const noFilter = "!@#$%^&*";
let startPoint = {};
let foundStat = false;
const ign = undefined;
let filter = noFilter;
if (!isMainThread)
    filter = workerData.filter;
const time = Date.now();
let place = "";
const key = { string: "E_breakOnfound" };
/** 
 * @param {string} path wanted path to be listed
**/
async function listDir(path) {
    try {
        return await fs.promises.readdir(path);
    } catch (error) {
        // console.log(path, Error("NOT ALLOWED TO CHECK"));
        return [];
    }
}
/** 
 * @param {string} path starting path
 * @param {Object} startPoint start point object
 * @param {callback} runIndexingCallBack call backfunction to runIndexing
**/
async function codeController(path, startPoint, startMThreadOrRunIndexing) {
    startPoint[path] = await listDir(path);
    startMThreadOrRunIndexing(path, runIndexing, ign, true);//it runs startMthread if it is called from the _`indexingM.js`_ if it is running as thread it calls `runindexing` function
    //`startMThread` only needs path
    //while the `runIndexing` function need the 3 other parameters => runIndexing,ign,true 
}
/** 
 * @param {string} keyVal starting path
 * @param {string} path starting path
 * @param {callback} func callback function
 * @param {Object} data Giving start point from another file
**/
export function editKeyThenRunIndexing(keyVal, path, func, data) {
    key.string = keyVal;
    runIndexing(path, func, data);
}

/** 
 * @param {string} path starting path
 * @param {callback} func callback function
 * @param {Object} data Giving start point from another file
 * @param {boolean} myself don't use it outside the `indexing.js` file (the original file) it is used to make a loop till fisishes all items and this functionallity should only work at the same place of the function
**/
function runIndexing(path, func, data, myself) {
    let array = data && data[path] !== undefined ? data[path] : startPoint[path] ? [...startPoint[path]] : [];
    array.forEach(async (element) => {
        if (!filter.includes(element) || filter == noFilter) {
            if (!element.toLowerCase().includes(key.string.toLowerCase())) {
                try {
                    if (fs.statSync(`${path}/${element}`).isDirectory()) {
                        startPoint[`${path}/${element}`] = await listDir(`${path}/${element}`);
                        if (!myself)
                            func(`${path}/${element}`,foundStat);//`startMThread` in indexingM.js
                        else {
                            func(`${path}/${element}`, runIndexing, ign, true);//it self (runIndexing)
                        }
                    }
                }
                catch (error) {
                    if (!element.includes(".")) {
                        startPoint[`${path}/${element}`] = await listDir(`${path}/${element}`);
                        if (!myself)
                            func(`${path}/${element}`,foundStat);//`startMThread` in indexingM.js
                        else {
                            func(`${path}/${element}`, runIndexing, ign, true);//it self (runIndexing)
                        }
                    }
                }
            }
            else {
                foundStat = true;
                place = `${path}/${element}`;
                func(place, true);//controlling startMThread to not intialize new thread and to terminate
                return true;
            }
        }
    });
}
function main(path, saveplace) {
    codeController(path, startPoint, runIndexing);
    process.on("exit", () => {
        // console.log(saveplace);
        if (saveplace) {
            // console.log("Started indexing (please don't close this window)");
            let timer = new Date(Date.now() - time);
            let datetime = timer.toUTCString(); // get the date and time string in UTC
            let timer2 = datetime.slice(-12, -4);
            console.log("time taken in seconds:", `${timer2}`);
            fs.writeFileSync(saveplace, JSON.stringify(startPoint));
            try {
                let data = fs.readFileSync(path.join(__dirname,"./logIndexing.txt"), "utf8");
                data += "\n" + "time consumed: " + timer2;
                fs.writeFileSync(path.join(__dirname,"./logIndexing.txt"), data);
            }
            catch {
                fs.writeFileSync(path.join(__dirname,"./logIndexing.txt"), "time consumed: " + timer2);
            }
        }
        else {
            parentPort.postMessage({ id:workerData.id,place: place, found: foundStat, startPoint: startPoint });
        }
    })
}
if (!isMainThread) {
    key.string = workerData.key;
    main(workerData.scanPlace);
}
export default listDir;
export { codeController, runIndexing };
