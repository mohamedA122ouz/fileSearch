import fs from "fs";
function isItFile(path){
    return fs.statSync(`${path}/${element}`).isDirectory();
}