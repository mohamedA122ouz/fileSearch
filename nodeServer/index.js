import { Worker } from "worker_threads";
import express from "express";
import { counter } from "./scripts/localSearch/HardSearch/indexingM break on find.js";
import path from "path";
import find from "./scripts/localSearch/searchHarder.js";
let isIndexingWorking = false;
const app = express();
app.use(express.json());
app.listen(4444, () => {
    console.log("Port: 4444");
});
app.get("/search", async (req, res) => {
    let searchKEY  = req.query.q;
    let i =  await find("",searchKEY);
    res.status(200);
    res.json(i);
});
app.get("/counter", (req, res) => {
    res.status(200);
    res.json(counter);
});
app.post("/find", (req, res) => {
    let info = req.body;
    let result = find(info);
    res.status(200).send(result);
});
