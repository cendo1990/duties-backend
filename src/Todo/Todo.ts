import { DataProvider, ErrorCode, ErrorData, ResData } from "../Common/DataProvider";
import { defaultFilterItem, FilterItem, GetRequest, GetResData } from "../Types/Get";
import { GetOneRequest } from "../Types/GetOne";
import { Express } from "express";
import merge from "lodash.merge";

export interface Todo{
    id: number;
    name: string;
}

export class TodoGetRequest extends GetRequest
{
    type: string ="todo";
    fields: string[] = ["id", "name"];
}

export class TodoGetOneRequest extends GetOneRequest
{
    type: string ="todo";
    fields: string[] = ["id", "name"];
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

    getFiltersMap(queryFilters:any, fields:string[])
    {
        let filtersMap = new Map<string, FilterItem>();
        console.log("get todo fields b", queryFilters);
        if( queryFilters && typeof queryFilters == "string" )
        {
            let filtersObj = JSON.parse(queryFilters);
            fields.forEach(key => {
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

    init()
    {
        this.app.get('/todos', (request, response) => {
            let getRes = new TodoGetRequest();
            getRes.filters = this.getFiltersMap(request?.query?.filters, getRes.fields);
            console.log("get todo", request.body, request.params, request.query, getRes);
            this.dataProvider.get(getRes, (data:any, total:number)=>{
                let resData: GetResData = {
                    code: 0,
                    data,
                    total
                }
                response.json(resData);
            }, (errorData:ErrorData)=>{
                let resData: GetResData = {
                    code: errorData.code,
                    data: [],
                    total: 0
                }
                response.json(resData);
            });
        });

        this.app.get('/todos/:id', (request, response) => {
            console.log("getOne todo", request.params.id);
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
                }
                response.json(resData);
            });
        });
    }
}