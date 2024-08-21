import { ResData } from "../Common/DataProvider";

interface GetOneInterface{
    type: string;
    id: number;
    fields: string[];
}

export class GetOneRequest implements GetOneInterface
{
    type: string ="";
    id = 0;
    fields: string[] = ["*"];
}