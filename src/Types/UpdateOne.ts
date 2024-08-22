interface UpdateOneInterface{
    type: string;
    data?: any;
}

export class UpdateOneRequest implements UpdateOneInterface
{
    type: string ="";
    data?: any;
}