import { Pool } from "pg";
import { FilterItem, GetRequest } from "../Types/Get";
import pgFormat from "pg-format"
import { env } from "process";
import dotenv from 'dotenv';
import { GetOneRequest } from "../Types/GetOne";

dotenv.config();

export interface BasicData
{
    id: number;
}

export enum ErrorCode
{
    NONE = 0,
    INTERNAL_ERROR = 10000,
    DB_ERROR = 10001,
    NOT_FOUND = 20000,
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
    
    get = (params:GetRequest, callback:Function, errCallback:Function) => {
        try {
            const fields = params?.fields?.length > 0 ? params.fields.join(", ") : "*";
            console.log("get", params);
            let whereCondition = this.getWhereCondition(params?.filters);
            const sql = pgFormat(`
                SELECT 
                    (SELECT count(*) FROM %I WHERE %s) as count, 
                    (SELECT json_agg(t.*) FROM (
                        SELECT %s FROM %I WHERE %s ORDER BY id LIMIT %s OFFSET %s
                    ) AS t)
            `, params.type, whereCondition.join(' AND '), fields, params.type, whereCondition.join(' AND '), params.limit.toString(), params.offset.toString());
            console.log(sql);
            DataProvider.pool.query(sql, (error, results)=>{
                if( error && errCallback )
                {
                    console.log(error);
                    errCallback(new ErrorData(ErrorCode.DB_ERROR, error));
                    return;
                }
                // console.log(results);
                if( results.rows.length == 1 )
                {
                    const data = results.rows[0].json_agg;
                    const total = results.rows[0].count;
                    console.log(data);
                    if(callback)
                    {
                        callback(data, total);
                    }
                }
                
            });
            
            
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
            DataProvider.pool.query(sql, (error, results)=>{
                if( error && errCallback )
                {
                    console.log(error);
                    errCallback(new ErrorData(ErrorCode.DB_ERROR, error));
                    return;
                }
                if( results.rows.length == 1 )
                {
                    const data = results.rows[0];
                    console.log(data);
                    if(callback)
                    {
                        callback(data);
                    }
                }
                else
                {
                    errCallback(new ErrorData(ErrorCode.NOT_FOUND, {}));
                }
            });
        } catch (error) {
            console.log(error);
            if( error && errCallback )
            {
                errCallback(new ErrorData(ErrorCode.INTERNAL_ERROR, error));
                return;
            }
        }
    };
    
    createOne = async (name:string) => {
        try {
            const insertUser = "INSERT INTO todo (name) VALUES ($1) RETURNING *";
            const result = await DataProvider.pool.query(insertUser, [name]);
            if( result.rows.length == 1 )
            {
                const user = result.rows[0];
                console.log("createTodo", user);
            }
            else
            {
                console.log("createTodo", result.rowCount);
            }
        } catch (error) {
            console.log(error);
        }
    }
    
    updateOne = async (data:BasicData) => {
        try {
            const id = data.id;
            const result = await DataProvider.pool.query("UPDATE todo SET name = $1 WHERE id = $2", ["name", id]);
            console.log(result);
            if(result.rowCount == 1)
            {
                console.log(data.id);
            }
        } catch (error) {
            console.log(error);
        }
    };
    
    deleteOne = async (id:number) => {
        try {
            const result = await DataProvider.pool.query("DELETE FROM todo WHERE id = $1", [id]);
            
            if(result.rowCount == 1)
            {
                console.log(id);
            }
        } catch (error) {
            console.log(error);
        }
    };
}