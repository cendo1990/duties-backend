import { Pool, QueryResult } from "pg";
import { FilterItem, GetRequest } from "../Types/Get";
import pgFormat from "pg-format"
import { env } from "process";
import dotenv from 'dotenv';
import { GetOneRequest } from "../Types/GetOne";
import { UpdateOneRequest } from "../Types/UpdateOne";
import { CreateOneRequest } from "../Types/CreateOne";
import { DeleteOneRequest } from "../Types/DeleteOne";

dotenv.config();

export interface BasicData
{
    id: number;
}

export enum ErrorCode
{
    NONE = 0,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_ERROR = 500,
}

export class ErrorData
{
    code: ErrorCode = 0;
    error: any = null;

    constructor(code: ErrorCode, error: any)
    {
        this.code = code;
        this.error = error;
    }
}

export interface ResData
{
    code: ErrorCode;
    data: any;
}

export class DataProvider
{
    static pool: Pool;

    static init()
    {
        if( !DataProvider.pool )
        {
            DataProvider.pool = new Pool({
                host: env.POSTGRES_HOST,
                user: env.POSTGRES_USER,
                password: env.POSTGRES_PASSWORD,
                database: env.POSTGRES_DB,
                port: env.POSTGRES_PORT ? parseInt(env.POSTGRES_PORT) : 5432,
                idleTimeoutMillis: 30000,
            });
        }
    }

    private getWhereCondition = (filters:Map<string, FilterItem>)=>{
        let whereCondition = ["1 = 1"];
        if( filters?.size > 0 )
        {
            filters.forEach((v:FilterItem, k:string)=>{
                let temp:string[] = [];
                v.values.forEach((v2:string)=>{
                    let str = `${k} ${v.operator} '${v2}'`;
                    console.log(str);
                    temp.push(str)
                })
                
                whereCondition.push(`${temp.join(v.relation)}`);
            })
        }
        return whereCondition;
    }

    dataManagerCallback = (callback:Function, errCallback:Function)=>(error:Error, results:QueryResult)=>{
        if( error && errCallback )
        {
            console.log(error);
            errCallback(new ErrorData(ErrorCode.INTERNAL_ERROR, error));
            return;
        }
        callback(results);
    };
    
    get = (params:GetRequest, callback:Function, errCallback:Function) => {
        try {
            const fields = params?.fields?.length > 0 ? params.fields.join(", ") : "*";
            console.log("get", params);
            let whereCondition = this.getWhereCondition(params?.filters);
            const sql = pgFormat(`
                SELECT 
                    (SELECT count(*) FROM %I WHERE %s) as count, 
                    (SELECT json_agg(t.*) FROM (
                        SELECT %s FROM %I WHERE %s ORDER BY id DESC LIMIT %s OFFSET %s
                    ) AS t)
            `, params.type, whereCondition.join(' AND '), fields, params.type, whereCondition.join(' AND '), params.limit.toString(), params.offset.toString());
            console.log(sql);
            DataProvider.pool.query(sql, this.dataManagerCallback((results:QueryResult)=>{
                if( results.rows.length == 1 )
                {
                    const data = results.rows[0].json_agg;
                    const total = parseInt(results.rows[0].count);
                    console.log(data);
                    if(callback)
                    {
                        callback(data, total);
                    }
                }
                else
                {
                    if( errCallback )
                    {
                        errCallback(new ErrorData(ErrorCode.NOT_FOUND, {}));
                        return;
                    }
                }
            }, errCallback));
        } catch (error) {
            console.log(error);
            if( error && errCallback )
            {
                errCallback(new ErrorData(ErrorCode.INTERNAL_ERROR, error));
                return;
            }
        }
    };
    
    getOne = async (params:GetOneRequest, callback:Function, errCallback:Function) => {
        try {
            const fields = params?.fields?.length > 0 ? params.fields.join(", ") : "*";
            const sql = pgFormat("SELECT %s FROM %I WHERE id = %s", fields, params.type, params.id);
            console.log(sql);
            DataProvider.pool.query(sql, this.dataManagerCallback((results:QueryResult)=>{
                if( results.rows.length == 1 )
                {
                    const data = results.rows[0];
                    console.log("getOne", data);
                    if(callback)
                    {
                        callback(data);
                    }
                }
                else
                {
                    if( errCallback )
                    {
                        errCallback(new ErrorData(ErrorCode.NOT_FOUND, {}));
                    }
                }
            }, errCallback));
        } catch (error) {
            console.log(error);
            if( error && errCallback )
            {
                errCallback(new ErrorData(ErrorCode.INTERNAL_ERROR, error));
                return;
            }
        }
    };
    
    createOne = async (params:CreateOneRequest, callback:Function, errCallback:Function) => {
        try {
            if( !params.data )
            {
                if( errCallback )
                {
                    errCallback(new ErrorData(ErrorCode.BAD_REQUEST, {}));
                }
                return;
            }
            let keys = Object.keys(params.data);
            let values = Object.values(params.data);
            values = values.map((obj)=>{
                return `'${obj}'`;
            });
            const sql = pgFormat("INSERT INTO %s (%s) VALUES (%s) RETURNING *", params.type, keys.join(', '), values.join(', '));
            console.log(sql);
            DataProvider.pool.query(sql, this.dataManagerCallback((results:QueryResult)=>{
                if( results.rows.length == 1 )
                {
                    const data = results.rows[0];
                    console.log("createOne", data);
                    if(callback)
                    {
                        callback(data);
                    }
                }
                else
                {
                    console.log("createOne", results.rowCount);
                    if( errCallback )
                    {
                        errCallback(new ErrorData(ErrorCode.NOT_FOUND, {}));
                    }
                }
            }, errCallback));
        } catch (error) {
            console.log(error);
            if( error && errCallback )
            {
                errCallback(new ErrorData(ErrorCode.INTERNAL_ERROR, error));
                return;
            }
        }
    }
    
    updateOne = async (params:UpdateOneRequest, callback:Function, errCallback:Function) => {
        try {
            if( !params.data || !params.data.id )
            {
                if( errCallback )
                {
                    errCallback(new ErrorData(ErrorCode.BAD_REQUEST, {}));
                }
                return;
            }
            const id = params.data.id;
            let setList:string[] = [];
            Object.keys(params.data).forEach((key:string)=>{
                if( params.data && key != "id" )
                {
                    setList.push(`${key} = '${params.data[key]}'`);
                }
            });
            const sql = pgFormat("UPDATE %s SET %s WHERE id = %s", params.type, setList.join(" AND "), params.data.id);
            console.log(sql);
            DataProvider.pool.query(sql, this.dataManagerCallback((results:QueryResult)=>{
                if( results.rowCount == 1 )
                {
                    const data = params.data;
                    if(callback)
                    {
                        callback(data);
                    }
                }
                else
                {
                    if( errCallback )
                    {
                        errCallback(new ErrorData(ErrorCode.NOT_FOUND, {}));
                    }
                }
            }, errCallback));
        } catch (error) {
            console.log(error);
            if( error && errCallback )
            {
                console.log(error);
                errCallback(new ErrorData(ErrorCode.INTERNAL_ERROR, error));
                return;
            }
        }
    };
    
    deleteOne = async (params:DeleteOneRequest, callback:Function, errCallback:Function) => {
        try {
            if( !params.id )
            {
                if( errCallback )
                {
                    errCallback(new ErrorData(ErrorCode.BAD_REQUEST, {}));
                }
                return;
            }
            const sql = pgFormat("DELETE FROM %s WHERE id = %s", params.type, params.id);
            console.log(sql);
            DataProvider.pool.query(sql, this.dataManagerCallback((results:QueryResult)=>{
                if(results.rowCount == 1)
                {
                    console.log(params.id);
                    if(callback)
                    {
                        callback({});
                    }
                }
                else
                {
                    if( errCallback )
                    {
                        errCallback(new ErrorData(ErrorCode.NOT_FOUND, {}));
                    }
                }
            }, errCallback));
        } catch (error) {
            console.log(error);
            if( error && errCallback )
            {
                console.log(error);
                errCallback(new ErrorData(ErrorCode.INTERNAL_ERROR, error));
                return;
            }
        }
    };
}