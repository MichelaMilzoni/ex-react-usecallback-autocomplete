import express from "express";
import morgan from "morgan";
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { errorHandler } from "./src/backend/lib/utilies.js";
import resourceRouter from "./src/backend/routes/resource.js";
dotenv.config();
const PORT = process.env.PORT || 3333;

const app = express();

app.use(
    morgan('dev', {
        skip: (req) => req.method === 'OPTIONS',
    })
);
app.use(express.json({ limit: 'Infinity' }));

app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(resourceRouter)
app.use(errorHandler);

// Log risorse disponibili dal database all'avvio del server
const databaseDir = path.join(process.cwd(), 'database');
fs.readdir(databaseDir, (err, files) => {
    if (err) {
        console.error(chalk.red('Errore nella lettura della cartella database:'), err);
    } else {
        const resources = files
            .filter(file => file.endsWith('.json'))
            .map(file => path.basename(file, '.json'));
        console.log(chalk.green('Risorse disponibili:'), chalk.cyan(resources.join(', ')));
    }
});

app.listen(PORT, () => {
    console.log(chalk.yellow(`Server avviato sulla porta ${PORT}`));
});