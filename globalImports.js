import fs from 'fs';
import find, { Type } from '../generalSearch/search.js';
import cmd from "child_process";
import { Worker } from 'worker_threads';
import read from "./scripts/localSearch/prompt-sync";
// export { fs, find, cmd, Worker, read };

const prompt = read();
prompt("sdf");