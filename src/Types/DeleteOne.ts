interface DeleteOneInterface{
    type: string;
    id: number;
}

export class DeleteOneRequest implements DeleteOneInterface
{
    type: string ="";
    id: number = 0;
}