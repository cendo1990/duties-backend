import { BasicData, DataProvider, ErrorCode, ErrorData, ResData } from "../Common/DataProvider";
import { defaultFilterItem, FilterItem, GetRequest, GetResData } from "../Types/Get";
import { GetOneRequest } from "../Types/GetOne";
import { Express } from "express";
import merge from "lodash.merge";
import { body, validationResult } from 'express-validator';
import { UpdateOneRequest } from "../Types/UpdateOne";
import { CreateOneRequest } from "../Types/CreateOne";
import { DeleteOneRequest } from "../Types/DeleteOne";

export interface Todo{
    id: number;
    name: string;
}

export class TodoData implements BasicData{
    id: number = 0;
    name: string= "";
}

const fields = ["id", "name"];
const type = "todo";

export class TodoGetRequest extends GetRequest
{
    type: string = type;
    fields: string[] = fields;
}

export class TodoGetOneRequest extends GetOneRequest
{
    type: string = type;
    fields: string[] = fields;
    data?: TodoData;
}

export class TodoUpdateOneRequest extends UpdateOneRequest
{
    type: string = type;
}

export class TodoCreateOneRequest extends CreateOneRequest
{
    type: string = type;
}

export class TodoDeleteOneRequest extends DeleteOneRequest
{
    type: string = type;
}

export class TodoAPI
{
    app:Express;
    dataProvider:DataProvider;
    constructor(app:Express, dataProvider:DataProvider)
    {
        this.app = app;
        this.dataProvider = dataProvider;
    }

    getFiltersMap(queryFilters:any)
    {
        let filtersMap = new Map<string, FilterItem>();
        console.log("get todo fields b", queryFilters);
        if( queryFilters && typeof queryFilters == "string" )
        {
            let filtersObj = JSON.parse(queryFilters);
            Object.keys(queryFilters).forEach(key => {
                if( filtersObj.hasOwnProperty(key) )
                {
                    let obj = merge({}, defaultFilterItem, filtersObj[key]);
                    filtersMap.set(key, obj);
                    console.log("get todo fields", key, filtersObj[key], obj);
                }
            });
        }
        return filtersMap;
    }

    getGetParams(query: any)
    {
        let offset = 0;
        let limit = 5;
        let filters = this.getFiltersMap(query?.filters);
        if( query )
        {
            if( query.offset && typeof query.offset == "string" )
            {
                offset = parseInt(query.offset);
            }
            if( query.limit && typeof query.limit == "string" )
            {
                limit = parseInt(query.limit);
            }
        }
        return { offset, limit, filters };
    }

    init()
    {
        this.app.get('/todos', (request, response) => {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(422).json({ errors: errors.array() });
            }
            const { offset, limit, filters } = this.getGetParams(request.query);
            let getRes = new TodoGetRequest(offset, limit, filters);
            console.log("get todo", request.body, request.params, request.query, getRes);
            this.dataProvider.get(getRes, (data:any, total:number)=>{
                let resData: GetResData = {
                    code: 0,
                    data,
                    total
                }
                return response.json(resData);
            }, (errorData:ErrorData)=>{
                let resData: GetResData = {
                    code: errorData.code,
                    data: [],
                    total: 0
                }
                return response.json(resData);
            });
        });

        this.app.get('/todos/:id', (request, response) => {
            console.log("getOne todo", request.body, request.params, request.query);
            let getOneRes = new TodoGetOneRequest();
            getOneRes.id = parseInt(request.params.id);
            this.dataProvider.getOne(getOneRes, (data:any, total:number)=>{
                let resData: GetResData = {
                    code: 0,
                    data,
                    total
                }
                response.json(resData);
            }, (errorData:ErrorData)=>{
                let resData: ResData = {
                    code: errorData.code,
                    data: []
                }
                switch(errorData.code)
                {
                    case ErrorCode.NOT_FOUND:
                        response.status(404);
                        break;
                    case ErrorCode.INTERNAL_ERROR:
                    case ErrorCode.INTERNAL_ERROR:
                        response.status(500);
                        break;
                }
                response.json(resData);
            });
        });

        this.app.put('/todos/:id', (request, response) => {
            console.log("updateOne todo", request.body, request.params, request.query);
            let getOneRes = new TodoGetOneRequest();

            getOneRes.id = parseInt(request.params.id);
            getOneRes.data = request.body;
            this.dataProvider.updateOne(getOneRes, (data:any)=>{
                console.log("updateOne todo 2", data);
                let resData: ResData = {
                    code: 0,
                    data
                }
                response.json(resData);
            }, (errorData:ErrorData)=>{
                let resData: ResData = {
                    code: errorData.code,
                    data: []
                }
                switch(errorData.code)
                {
                    case ErrorCode.BAD_REQUEST:
                        response.status(400);
                        break;
                    case ErrorCode.NOT_FOUND:
                        response.status(404);
                        break;
                    case ErrorCode.INTERNAL_ERROR:
                    case ErrorCode.INTERNAL_ERROR:
                        response.status(500);
                        break;
                }
                response.json(resData);
            });
        });

        this.app.post('/todos', (request, response) => {
            console.log("updateOne todo", request.body, request.params, request.query);
            let createOneRes = new TodoCreateOneRequest();

            createOneRes.data = request.body;
            this.dataProvider.createOne(createOneRes, (data:any)=>{
                console.log("updateOne todo 2", data);
                let resData: ResData = {
                    code: 0,
                    data
                }
                response.json(resData);
            }, (errorData:ErrorData)=>{
                let resData: ResData = {
                    code: errorData.code,
                    data: []
                }
                switch(errorData.code)
                {
                    case ErrorCode.BAD_REQUEST:
                        response.status(400);
                        break;
                    case ErrorCode.NOT_FOUND:
                        response.status(404);
                        break;
                    case ErrorCode.INTERNAL_ERROR:
                    case ErrorCode.INTERNAL_ERROR:
                        response.status(500);
                        break;
                }
                response.json(resData);
            });
        });

        this.app.delete('/todos/:id', (request, response) => {
            console.log("deleteOne todo", request.body, request.params, request.query);
            let getOneRes = new TodoDeleteOneRequest();
            getOneRes.id = parseInt(request.params.id);
            this.dataProvider.deleteOne(getOneRes, (data:any)=>{
                console.log("deleteOne todo 2", data);
                let resData: ResData = {
                    code: 0,
                    data
                }
                response.json(resData);
            }, (errorData:ErrorData)=>{
                let resData: ResData = {
                    code: errorData.code,
                    data: []
                }
                switch(errorData.code)
                {
                    case ErrorCode.BAD_REQUEST:
                        response.status(400);
                        break;
                    case ErrorCode.NOT_FOUND:
                        response.status(404);
                        break;
                    case ErrorCode.INTERNAL_ERROR:
                    case ErrorCode.INTERNAL_ERROR:
                        response.status(500);
                        break;
                }
                response.json(resData);
            });
        });
    }
}