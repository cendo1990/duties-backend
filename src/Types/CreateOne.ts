interface CreateOneInterface{
    type: string;
    data?: any;
}

export class CreateOneRequest implements CreateOneInterface
{
    type: string ="";
    data?: any;
}