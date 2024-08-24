import { BasicData } from "../Common/DataProvider";

interface CreateOneInterface{
    type: string;
    data?: BasicData;
}

export class CreateOneRequest implements CreateOneInterface
{
    type: string ="";
    data?: any;

    constructor(type:string)
    {
        this.type = type;
    }
}