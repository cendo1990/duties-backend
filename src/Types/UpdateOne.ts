import { BasicData } from "../Common/DataProvider";

interface UpdateOneInterface{
    type: string;
    data?: any;
}

export class UpdateOneRequest implements UpdateOneInterface
{
    type: string ="";
    data?: any;

    constructor(type:string)
    {
        this.type = type;
    }
}