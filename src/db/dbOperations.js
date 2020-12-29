const mongodb = require("mongodb");
const logger = require("../logger");

const MongoClient = mongodb.MongoClient;

const url = process.env.MONGODB_URL;
const dbName = process.env.MONGODB_NAME;


const createCollection = async(collectionName) => {
    try{
        const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        const myDB = client.db(dbName);
        const res = await myDB.createCollection(collectionName);
        logger.info(`Collection created : ${collectionName}`);    
        return res;
    }catch(err){
        console.log(err);
        throw err;
    }finally{
        client.close();
    }
}

const dropCollection = async(collectionName) => {
    try{
        const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        const myDB = client.db(dbName);
        const res = await myDB.collection(collectionName).drop();
        logger.info(`Collection dropped : ${collectionName}`);    
        return res;
    }catch(err){
        console.log(err);
        throw err;
    }finally{
        client.close();
    }
}


const insertOne = async(collectionName,doc) => {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    try{
        const myDB = client.db(dbName);
        const res = await myDB.collection(collectionName).insertOne(doc);
        client.close();
        return res.ops;
    }catch(err){
        console.log(err);
        throw err;
    }finally{
        client.close();
    }
}

const findOne = async(collectionName,query,projection) => {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    try{
        const myDB = client.db(dbName);
        const res = await myDB.collection(collectionName).findOne(query,{projection});
        client.close();
        return res;
    }catch(err){
        console.log(err);
        throw err;
    }
}

const find = async(collectionName,query,projection,limit,skip) => {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    try{
        const myDB = client.db(dbName);
        const res = await myDB.collection(collectionName).find(query,{projection}).limit(limit).skip(skip).sort({"timestamp": -1}).toArray();
        client.close();
        return res;
    }catch(err){
        console.log(err);
        throw err;
    }
}

const deleteOne = async(collectionName,query) => {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    try{
        const myDB = client.db(dbName);
        const res = await myDB.collection(collectionName).deleteOne(query);
        client.close();
        return res;
    }catch(err){
        console.log(err);
        throw err;
    }
}

module.exports = {createCollection, dropCollection, insertOne, findOne ,find, deleteOne};