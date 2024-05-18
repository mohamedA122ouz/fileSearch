import read from "prompt-sync";
const prompt = read();
import cmd from "child_process";
import MTindexingPlace from "./HardSearch/indexingM break on find.js";
import search from "../generalSearch/search.js";
import fs from "fs";
import path from "path";
import runCMD from "./localSearch.js";
import merge from "./HardSearch/merge.js";
import { fileURLToPath } from "url";
let result = undefined;
let waitTofinishSearch = true;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default async function perfectSearch(key, searchKey) {
    console.log(`some usefull queries:
    q:scan to scan selected drive (selected in key file)
    q:resCash to reset cash file
    q:key to edit key file
    `);
    waitTofinishSearch = false;
    let properties = JSON.parse(fs.readFileSync(key || path.join(__dirname, "./key.json")));
    if (properties.filter.length !== 0) {
        console.log("filter is enabled in:", properties.filter);
    }
    let searchFile = searchKey || prompt("Enter file name: ");
    if (searchFile === "q:scan") {
        result = await MTindexingPlace(properties.indexingPlace, path.join(__dirname, "../../memory/ENew.json"), searchFile).catch(el => { return { path: [], parentPath: [] } });
        console.log("scan finished!\nwaiting for merge...");
        merge(path.join(__dirname, "../../memory/ENew.json"), path.join(__dirname, properties.cashMemory[properties.search.cashMemoryFile]), path.join(__dirname, properties.cashMemory[properties.search.cashMemoryFile]));
        console.log("merge done!");
    }
    else if (searchFile === "q:key") {
        cmd.exec(`start notepad ${path.join(__dirname, "./key.json")}`, (stderr, stdout, std) => { return; });
    }
    else if (searchFile === "q:resCash") {
        fs.writeFileSync(properties.cashMemory[properties.search.cashMemoryFile], "{}");
        console.log("cash resetted Successully!");
    }
    else {
        result = search(searchFile, path.join(__dirname, properties.cashMemory[properties.search.cashMemoryFile]), properties.searchType[properties.search.type], properties.filter);
        if (result.path.length === 0) {
            result = await MTindexingPlace(properties.indexingPlace, path.join(__dirname, "../../memory/ENew.json"), searchFile).catch(el => { return { path: [], parentPath: [] } });
            console.log("100%");
            merge(path.join(__dirname, "../../memory/ENew.json"), path.join(__dirname, properties.cashMemory[properties.search.cashMemoryFile]), path.join(__dirname, properties.cashMemory[properties.search.cashMemoryFile]));
        }
        else {
            console.log("Scanning whether exist...");
            for (let i in result) {
                if (fs.existsSync(i)) {
                    console.log(i, "is not exist");
                    console.log("You May Need a new Hard scan");
                    prompt("Do you wan:")
                }
            }
        }
        console.log(result);
        runCMD(result, properties);
    }
    waitTofinishSearch = true;
    return result;
}