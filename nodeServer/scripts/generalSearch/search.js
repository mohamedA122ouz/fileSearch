import fs from 'fs';
const Type = { FIRST: 0, All: 1 };
export { Type };
export default function find(key, where, type, filter) {
    let files = fs.readFileSync(where, "utf8");
    let fileDetails = { path: [], parentPath: [], index: [], fileObject: [] };
    files = JSON.parse(files);
    if (filter) {
        if (typeof filter === "string") {
            let temp = files[filter];
            files = {};
            files[filter] = temp;
        } else if (typeof filter === "object") {
            if (filter instanceof Array) {
                if (filter.length != 0) {
                    let temp = {};
                    for (let filterKey in filter) {
                        temp[filter[filterKey]] = files[filter[filterKey]];
                    }
                    files = { ...temp };
                }
            }
        }
    }
    for (let i in files) {
        let index = -1;
        for (let name in files[i]) {
            if (files[i][name].toLowerCase().indexOf(key.toLowerCase()) !== -1) {
                index = parseInt(name);
                break;
            }
        }
        // console.log(index);
        if (index !== -1) {
            fileDetails.fileObject.push(files[i]);
            fileDetails.parentPath.push(i);
            fileDetails.path.push(i + (files[i][index] ? "/" : "") + (files[i][index] || ""));
            fileDetails.index.push(index);
            if (type === Type.FIRST)
                break;
        }
    }
    return fileDetails;

}