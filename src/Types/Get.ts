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

    constructor(filters:Map<string, FilterItem> = new Map<string, FilterItem>())
    {
        this.filters = filters;
    }
}

export interface GetResData extends ResData
{
    total: number;
}