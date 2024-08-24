import { DataProvider } from "./src/Common/DataProvider";
import { TodoApi } from "./src/Todo/TodoApi";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";


DataProvider.init();
const dataProvider = new DataProvider();

const corsOptions = {
    origin: [
        'http://127.0.0.1:3000',
        'http://localhost:3000'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();
const port = 25000;

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors(corsOptions));

let todoApi = new TodoApi("todo", app, dataProvider);
todoApi.init();

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
