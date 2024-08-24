import { BasicData, DataProvider, ErrorCode, ErrorData, ResData } from "../Common/DataProvider";
import { defaultFilterItem, FilterItem, GetRequest, GetResData } from "../Types/Get";
import { GetOneRequest } from "../Types/GetOne";
import { Express, Request, Response } from "express";
import merge from "lodash.merge";
import { validationResult } from 'express-validator';
import { UpdateOneRequest } from "../Types/UpdateOne";
import { CreateOneRequest } from "../Types/CreateOne";
import { DeleteOneRequest } from "../Types/DeleteOne";

export class BasicApi
{
    type:string = "";
    app:Express;
    dataProvider:DataProvider;
    constructor(type:string, app:Express, dataProvider:DataProvider)
    {
        this.type = type;
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

    setStatus(response: Response, code:ErrorCode)
    {
        response.status(code);
    }

    getValidationResultErrorData(request:Request)
    {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            let resData: ResData = {
                code: ErrorCode.UNPROCESSABLE_CONTENT,
                data: []
            }
            return resData;
        }
        return null;
    }

    getDataErrorData(data:any):ResData | undefined
    {
        return undefined;
    }

    getIdErrorData(str:string)
    {
        try {
            let id = parseInt(str);
            if( !isNaN(id) )
            {
                
                return null;
            }
        } catch (error) {
            console.log("getIdErrorData", error);
        }
        let resData: ResData = {
            code: ErrorCode.NOT_FOUND,
            data: []
        }
        return resData; 
    }

    init()
    {
        this.app.get(`/${this.type}s`, (request, response) => {
            const validationResultErrorData = this.getValidationResultErrorData(request);
            if (validationResultErrorData) {
                return response.status(ErrorCode.UNPROCESSABLE_CONTENT).json(validationResultErrorData);
            }
            const { offset, limit, filters } = this.getGetParams(request.query);
            let getRes = new GetRequest(this.type, offset, limit, filters);
            console.log("get", this.type, request.body, request.params, request.query, getRes);
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

        this.app.get(`/${this.type}s/:id`, (request, response) => {
            console.log("getOne", this.type, request.body, request.params, request.query);
            const validationResultErrorData = this.getValidationResultErrorData(request);
            if (validationResultErrorData) {
                return response.status(ErrorCode.UNPROCESSABLE_CONTENT).json(validationResultErrorData);
            }
            const idErrorData = this.getIdErrorData(request.params.id);
            if(idErrorData)
            {
                return response.status(ErrorCode.NOT_FOUND).json(idErrorData);
            }
            let getOneRes = new GetOneRequest(this.type);
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
                this.setStatus(response, errorData.code);
                response.json(resData);
            });
        });

        this.app.put(`/${this.type}s/:id`, (request, response) => {
            console.log("updateOne", this.type, request.body, request.params, request.query);
            const validationResultErrorData = this.getValidationResultErrorData(request);
            if (validationResultErrorData) {
                return response.status(ErrorCode.UNPROCESSABLE_CONTENT).json(validationResultErrorData);
            }
            const idErrorData = this.getIdErrorData(request.params.id);
            if(idErrorData)
            {
                return response.status(ErrorCode.NOT_FOUND).json(idErrorData);
            }
            const errorData = this.getDataErrorData(request?.body);
            if(errorData)
            {
                return response.status(ErrorCode.BAD_REQUEST).json(errorData);
            }
            let getOneRes = new UpdateOneRequest(this.type);
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
                this.setStatus(response, errorData.code);
                response.json(resData);
            });
        });

        this.app.post(`/${this.type}s`, (request, response) => {
            console.log("updateOne", this.type, request.body, request.params, request.query);
            const validationResultErrorData = this.getValidationResultErrorData(request);
            if (validationResultErrorData) {
                return response.status(ErrorCode.UNPROCESSABLE_CONTENT).json(validationResultErrorData);
            }
            let errorData = this.getDataErrorData(request?.body);
            if(errorData)
            {
                return response.status(ErrorCode.BAD_REQUEST).json(errorData);
            }
            let createOneRes = new CreateOneRequest(this.type);
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
                this.setStatus(response, errorData.code);
                response.json(resData);
            });
        });

        this.app.delete(`/${this.type}s/:id`, (request, response) => {
            console.log("deleteOne", this.type, request.body, request.params, request.query);
            const validationResultErrorData = this.getValidationResultErrorData(request);
            if (validationResultErrorData) {
                return response.status(ErrorCode.UNPROCESSABLE_CONTENT).json(validationResultErrorData);
            }
            const idErrorData = this.getIdErrorData(request.params.id);
            if(idErrorData)
            {
                return response.status(ErrorCode.NOT_FOUND).json(idErrorData);
            }
            let getOneRes = new DeleteOneRequest(this.type);
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
                this.setStatus(response, errorData.code);
                response.json(resData);
            });
        });
    }
}