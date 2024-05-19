import fs from 'fs';
import findHarder from "../generalSearch/searchHarder.js"
import find, { Type } from '../generalSearch/search.js';
import cmd from "child_process";
import { Worker } from 'worker_threads';
import read from "prompt-sync";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prompt = read();
let key = {};
let searchResult = {};
key = fs.readFileSync(path.join(__dirname, "./key.json"), "utf-8");
key = JSON.parse(key);
let thread = null;
export function localSearch(dataParameter) {
    key = dataParameter;
    loadData();
    return searchResult;
}
function loadData() {
    let finderKey = prompt("search Key: ") || key.search.key;
    if (key.type[key.search.type] === "all") {
        searchResult = find(finderKey, key.cashMemory[key.search.cashMemoryFile], Type.All, key.filter);
    }
    else {
        searchResult = find(finderKey, key.cashMemory[key.search.cashMemoryFile], Type.FIRST, key.filter);
    }
    runCMD(searchResult, key);
}
// loadData();
/**
 *@param {object} data wanted data
 *@param {object} key properties
 *@param {boolean} server if it is server or not  
 **/
function runCMD(data, key, server) {
    let arrayOfPaths = key.openOptions[key.search.openOnFound] === 1/*open found file*/ ? data.path : key.openOptions[key.search.openOnFound] === -1/*open Found Folder*/ ? data.parentPath : [];
    if (key.openOptions[key.search.openOnFound] !== 0 && data.length < 2) {
        arrayOfPaths.forEach(path => {
            path = path.replace("//", "/");
            path = path.replaceAll(/\//ig, "\\");
            if (key.openOptions[key.search.openOnFound] === 1) {
                //openOnFoundFile
                cmd.exec(`"${path}"`, (stderr, stdout, std) => { });
            } else if (key.openOptions[key.search.openOnFound] === -1) {
                //openOnFoundFolder
                console.log(`start explorer "${path}"`);
                cmd.exec(`start explorer "${path.replace("//", "/")}"`, (stderr, stdout, std) => { });
            }
        });
    }
    else {
        if (server) {
            console.warn("CANNOT OPEN MANY APPS FOR SYSTEM STABILITY REASONS!!");
            console.warn("THOSE ARE THE PATHS WHICH WOULD BE OPEN YOU CAN CHOOSE ANY ONE");
            let editedpaths = [];
            data["path"].forEach((path, i) => {
                path = path.replace("//", "/");
                path = path.replaceAll(/\//ig, "\\");
                editedpaths.push(path);
                console.log(i, ":", path);
            });
            do{
                let wantedPath =0;
                do{
                    wantedPath = prompt("ENTER NUMBER: ");
                    wantedPath = parseInt(wantedPath);
                    if(wantedPath<0){
                        return;
                    }
                }while(isNaN(wantedPath) && wantedPath>editedpaths.length)
                if (key.openOptions[key.search.openOnFound] === 1) {
                    //openOnFoundFile
                    cmd.exec(`"${arrayOfPaths[wantedPath]}"`, (stderr, stdout, std) => { });
                } else if (key.openOptions[key.search.openOnFound] === -1) {
                    //openOnFoundFolder
                    console.log(`start explorer "${wantedPath}"`);
                    cmd.exec(`start explorer "${path.replace("//", "/")}"`, (stderr, stdout, std) => { });
                }
            }while(true);
        }
    }
}
//console.log(searchResult);
if (!key.search.instanceTerminate) {
    cmd.exec(`pause`, (stderr, stdout, std) => { });
}
// while(true){
//     loadData(); 
// }
export default runCMD;
