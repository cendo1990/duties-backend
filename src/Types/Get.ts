import { ResData } from "../Common/DataProvider";

export interface FilterItem
{
    values: string[];
    operator: string;
    relation: string;
}

export const defaultFilterItem =
{
    values: [],
    operator: "=",
    relation: "&&"
}

export interface GetInterface{
    type: string;
    offset: number;
    limit: number;
    fields: string[];
    filters: Map<string, FilterItem>;
}

export class GetRequest implements GetInterface
{
    type: string ="";
    offset: number = 0;
    limit: number = 5;
    fields: string[] = ["*"];
    filters = new Map<string, FilterItem>();

    constructor(type:string, offset: number = 0, limit: number = 5, filters:Map<string, FilterItem> = new Map<string, FilterItem>())
    {
        this.type = type;
        this.offset = offset;
        this.limit = limit;
        this.filters = filters;
    }
}

export interface GetResData extends ResData
{
    total: number;
}