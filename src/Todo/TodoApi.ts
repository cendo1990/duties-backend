import { ErrorCode, ResData } from "../Common/DataProvider";
import { BasicApi } from "../Common/BasicApi";

export class TodoApi extends BasicApi
{

    getDataErrorData(data:any):ResData | undefined
    {
        if(!data?.name || data?.name.length > 20)
        {
            let resData: ResData = {
                code: ErrorCode.BAD_REQUEST,
                data: []
            }
            return resData;
        }
        return undefined;
    }
}