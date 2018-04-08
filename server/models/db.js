var dbconifg = require('./conifg.js');
var MongoClient = require('mongodb').MongoClient;

// 连接数据库模块
function _connectDB(callBack) {
    // 数据库的连接路径
    var url = dbconifg._db_url_;

    MongoClient.connect(url, function (err, db){
        if(err){
            callBack(err, null);
            return 
        }
        callBack(err, db)
    })
}

// 连接数据库并进行初始化
function init() {
    _connectDB(function(err, db) {
        if(err){
            console.log(err);
            return 
        }
        db.collection('users').createIndex(
            { "username": 1},
            null,
            function(err, results) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("索引建立成功");
            }
        );
    })
}
// 每次打开必须先连接数据库
init();

//  插入一条数据
exports.insertOne = function (collectionName, json, callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName)
            .insertOne(json, function (err, result) {
                callback(err, result);
                db.close(); //关闭数据库
            })
    })
};
//查找数据，找到所有数据。args是个对象{"pageamount":10,"page":10}
exports.find = function (collectionName, json, C, D) {
    var result = []; //结果数组
    if (arguments.length == 3) {
        //那么参数C就是callback，参数D没有传。
        var callback = C;
        var skipnumber = 0;
        //数目限制
        var limit = 0;
    } else if (arguments.length == 4) {
        var callback = D;
        var args = C;
        //应该省略的条数
        var skipnumber = args.pageamount * args.page || 0;
        //数目限制
        var limit = args.pageamount || 0;
        //排序方式
        var sort = args.sort || {};
    } else {
        throw new Error("find函数的参数个数，必须是3个，或者4个。");
        return;
    }

    //连接数据库，连接之后查找所有
    _connectDB(function (err, db) {
        var cursor = db
            .collection(collectionName)
            .find(json)
            .skip(skipnumber)
            .limit(limit)
            .sort(sort);
        cursor.each(function (err, doc) {
            if (err) {
                callback(err, null);
                db.close(); //关闭数据库
                return;
            }
            if (doc != null) {
                result.push(doc); //放入结果数组
            } else {
                //遍历结束，没有更多的文档了
                callback(null, result);
                db.close(); //关闭数据库
            }
        });
    });
}

exports.getAllCount = function (collectionName,callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).count({}).then(function(count) {
            callback(count);
            db.close();
        });
    })
}
//删除
exports.deleteMany = function (collectionName, json, callback) {
    _connectDB(function (err, db) {
        //删除
        db.collection(collectionName).deleteMany(
            json,
            function (err, results) {
                callback(err, results);
                db.close(); //关闭数据库
            }
        );
    });
}
// 修改数据
exports.changeMany = function (collectionName, json, callback) {
    _connectDB(function (err, db) {
        var obj = db.collection(collectionName).update(json.query,json.update,false,true);

        obj.then(r => callback(r))
        
    })
}