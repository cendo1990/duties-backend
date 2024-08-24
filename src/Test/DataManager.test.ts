import { DataProvider, ErrorData } from "../Common/DataProvider";
import { CreateOneRequest } from "../Types/CreateOne";
import { DeleteOneRequest } from "../Types/DeleteOne";
import { GetRequest } from "../Types/Get";
import { GetOneRequest } from "../Types/GetOne";
import { UpdateOneRequest } from "../Types/UpdateOne";

const type = "todo"

jest.setTimeout(60000);

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
            let getRes = new GetRequest(type, 0, 1000000);
            dataProvider.get(getRes, (data:any)=>{
                console.log("get length", data);
                expect(data.length == 0 || data.id != id).toBe(true);
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

    test("test updateOne, createOne validation", done => {
        DataProvider.init();
        const dataProvider = new DataProvider();

        let createName = "12345678901234567890";
        let invalidName = "123456789012345678901234567890";

        let createOneInvalidPromise = new Promise((resolve, reject)=>{
            let createRes = new CreateOneRequest(type);
            createRes.data = {
                name: invalidName
            }
            dataProvider.createOne(createRes, (data:any)=>{
                console.log("createOne invalid", data);
                resolve(data.id);
            }, (errorData:ErrorData)=>{
                console.log("createOne invalid", errorData);
                expect(errorData.code).toBe(400);
                reject(errorData);
            });
        });

        let createOnePromise = new Promise((resolve, reject)=>{
            let createRes = new CreateOneRequest(type);
            createRes.data = {
                name: createName
            }
            dataProvider.createOne(createRes, (data:any)=>{
                console.log("createOne", data);
                resolve(data.id);
            }, (errorData:ErrorData)=>{
                console.log("createOne", errorData);
                reject(errorData);
            });
        });

        let updateOneInvalidPromise = (createdId:string)=> new Promise((resolve, reject)=>{
            let updateRes = new UpdateOneRequest(type);
            updateRes.data = {
                id: createdId,
                name: invalidName
            }
            console.log("updateOne", updateRes.data);
            dataProvider.updateOne(updateRes, (data:any)=>{
                console.log("updateOne", data);
                expect(data.name).toBe(updateRes.data.name);
                resolve(data.id);
            }, (errorData:ErrorData)=>{
                console.log("updateOne", errorData);
                expect(errorData.code).toBe(400);
                reject(errorData);
            })
        });

        createOneInvalidPromise.then(()=>{
            done();
        }).catch((errorData)=>{
            expect(errorData.code).toBe(400);
            createOnePromise.then((createdId:any)=>{
                console.log("create success", createdId);
                updateOneInvalidPromise(createdId).then(()=>{
                    done();
                }).catch((errorData2)=>{
                    expect(errorData2.code).toBe(400);
                    done();
                })
            }).catch((errorData2)=>{
                expect(errorData2.code).toBe(400);
                done();
            });
        })
    });
    
    test("test updateOne sql injection", done => {
        DataProvider.init();
        const dataProvider = new DataProvider();

        let updateName = "jest test"

        let updateOnePromise = (id:string)=> new Promise((resolve, reject)=>{
            let updateRes = new UpdateOneRequest(type);
            updateRes.data = {
                id: id,
                name: updateName
            }
            console.log("updateOne", updateRes.data);
            dataProvider.updateOne(updateRes, (data:any)=>{
                console.log("updateOne", data);
                expect(data.name).toBe(updateRes.data.name);
                resolve(data.id);
            }, (errorData:ErrorData)=>{
                console.log("updateOne", errorData);
                expect(errorData.code).toBe(500);
                reject(errorData);
            })
        });

        updateOnePromise("1 OR 1 = 1").then(()=>{
            done();
        }).catch((errorData)=>{
            expect(errorData.code).toBe(500);
            done();
        })
    });
    
    test("test deleteOne sql injection", done => {
        DataProvider.init();
        const dataProvider = new DataProvider();

        let deleteOnePromise = (id:string)=> new Promise((resolve, reject)=>{
            try {
                let deleteRes = new DeleteOneRequest(type);
                // @ts-ignore
                deleteRes.id = id;
                console.log("deleteOne", deleteRes.id);
                dataProvider.deleteOne(deleteRes, (data:any)=>{
                    console.log("deleteOne", data);
                    expect(data).toBe(1);
                    resolve(data.id);
                }, (errorData:ErrorData)=>{
                    console.log("deleteOne", errorData);
                    expect(errorData.code).toBe(500);
                    reject(errorData);
                })
            } catch (error) {
                console.log("deleteOne catch 2", error);
            }
            
        });

        deleteOnePromise("1 OR 1 = 1").then(()=>{
            done();
        }).catch((errorData)=>{
            console.log("deleteOne catch", errorData);
            expect(errorData.code).toBe(500);
            done();
        })
    });


});