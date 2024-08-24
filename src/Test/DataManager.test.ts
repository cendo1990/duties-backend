import { DataProvider, ErrorData } from "../Common/DataProvider";
import { CreateOneRequest } from "../Types/CreateOne";
import { DeleteOneRequest } from "../Types/DeleteOne";
import { GetRequest } from "../Types/Get";
import { GetOneRequest } from "../Types/GetOne";
import { UpdateOneRequest } from "../Types/UpdateOne";

const type = "todo"

jest.setTimeout(30000);

describe("test todo", () => {
    test("test create, update, getOne, delete, get", done => {
        DataProvider.init();
        const dataProvider = new DataProvider();

        let createName = "jest test";
        let updateName = "jest test 2"

        let createOnePromise = new Promise((resolve, reject)=>{
            let createRes = new CreateOneRequest(type);
            createRes.data = {
                name: createName
            }
            dataProvider.createOne(createRes, (data:any)=>{
                console.log("createOne", data);
                expect(data.name).toBe(createRes.data.name);
                resolve(data.id);
            }, (errorData:ErrorData)=>{
                console.log("createOne", errorData);
                expect(errorData.code).toBe(0);
                done();
                reject();
            });
        });

        let updateOnePromise = (createdId:string)=> new Promise((resolve, reject)=>{
            let updateRes = new UpdateOneRequest(type);
            updateRes.data = {
                id: createdId,
                name: updateName
            }
            console.log("updateOne", updateRes.data);
            dataProvider.updateOne(updateRes, (data:any)=>{
                console.log("updateOne", data);
                expect(data.name).toBe(updateRes.data.name);
                resolve(data.id);
            }, (errorData:ErrorData)=>{
                console.log("updateOne", errorData);
                expect(errorData.code).toBe(0);
                done();
                reject();
            })
        });

        let getOnePromise = (id:any)=> new Promise((resolve, reject)=>{
            let getRes = new GetOneRequest(type);
            getRes.id = parseInt(id);
            console.log("getOne", getRes.id);
            dataProvider.getOne(getRes, (data:any)=>{
                console.log("getOne", data);
                expect(data.name).toBe(updateName);
                resolve(data.id);
            }, (errorData:ErrorData)=>{
                console.log("getOne", errorData);
                expect(errorData.code).toBe(0);
                done();
                reject();
            })
        });

        let deleteOnePromise = (id:any)=> new Promise((resolve, reject)=>{
            let getRes = new DeleteOneRequest(type);
            getRes.id = parseInt(id);
            console.log("deleteOne", getRes.id);
            dataProvider.deleteOne(getRes, (data:any)=>{
                console.log("deleteOne", data);
                expect(data).toBe(1);
                resolve(id);
            }, (errorData:ErrorData)=>{
                console.log("deleteOne", errorData);
                expect(errorData.code).toBe(0);
                done();
                reject();
            })
        });

        let getPromise = (id:any)=> new Promise((resolve, reject)=>{
            let getRes = new GetRequest(type, 0, 5);
            dataProvider.get(getRes, (data:any)=>{
                console.log("get length", data);
                expect(data.length == 0 || data[0].id != id).toBe(true);
                resolve(data);
            }, (errorData:ErrorData)=>{
                console.log("get", errorData);
                expect(errorData.code).toBe(0);
                done();
                reject();
            });
        });

        createOnePromise.then((createId:any)=>{
            updateOnePromise(createId).then((id:any)=>{
                getOnePromise(id).then(()=>{
                    deleteOnePromise(id).then((deleteId:any)=>{
                        getPromise(deleteId).then(()=>{
                            done();
                        });
                    });
                });
            });
        });
    });
});