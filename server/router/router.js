
var formidable = require("formidable");
var db = require("../models/db.js");
var md5 = require("../models/md5.js");
var path = require("path");
var fs = require("fs");
var util = require('util');
var moment = require('moment');
var _ = require('lodash');
//var gm = require("gm");

//首页
exports.showIndex = function (rq, rs, n) {
    n();
};
// 简历  /rsume 
exports.showRsume = function (rq, rs, n) {
    rs.status(200);
    rs.send({"name": "bianjunping"})
}
//  管理员登录接口
exports.showAdmin = function(rq, rs, n){
    var form = new formidable.IncomingForm()
    
    form.parse(rq, function(err, fields, files) {
        var username = fields.username,
            password = fields.password;
            
        password = md5(md5(password) + "admin");
        //现在可以证明，用户名没有被占用
            // db.insertOne("users", {
            //     "username": username,
            //     "password": password,
            //     "avatar": "moren.jpg"
            // }, function (err, result) {
            //     if (err) {
            //         res.send("-3"); //服务器错误
            //         return;
            //     }
            // })
        //查询数据库，看看有没有个这个人
        db.find("users", {"username": username}, {},function (err, result) {
            if (err) {
                rs.send("-5");
                return;
            }
            //没有这个人
            if (result.length == 0) {
                rs.send("-1"); //用户名不存在
                return;
            }
            
            //有的话，进一步看看这个人的密码是否匹配
            if (password == result[0].password) {
                
                rq.session.login = "1";
                rq.session.username = username;

                rs.status(200);
                //rs.end(util.inspect({fields: fields, files: files}))
                rs.send("1")
                return;
            } else {
                rs.send("-2");  //密码错误
                return;
            }
        });
    });
}

// 获取所有的留言数据
exports.getLeaveData = function(rq, rs, n) {
    if (rq.session.login != "1") {
        rs.send({"status":"-10","title":"非法闯入，这个页面要求登陆"});
        return;
    }
    
    var form = new formidable.IncomingForm();
    form.parse(rq, function(err, fields, files){
        var page = fields.params.page;
        var pageamount = fields.params.pageamount;
        var searchPerson = fields.params.searchPerson;
        db.getAllCount("posts",function(count){
        
            count = count.toString();
            if(searchPerson != ''){
                var json = {
                    username:searchPerson
                }
            }else{
                json = {}
            }
            db.find("posts",json, {
                "pageamount": parseInt(pageamount),
                "page": page,
                "sort": {
                    "datetime": -1
                }
            }, (err, result) => {
                rs.status(200);
                rs.json({result,count});
            });
        });
    })
    
            
}

// 创建一条信息 并 添加到 posts 数据中
exports.writeMany = function(rq, rs, n){
    var form = new formidable.IncomingForm();
    form.parse(rq, function(err, fields, files){
        var json = {
            username: fields.username,
            creattime: moment().format('YYYY-MM-DD hh:mm:ss').toString(),
            content: [fields.content]
        }
        db.find('posts',{username:json.username},(err, result) => {
            if(err){
                rs.send('-3');
                return;
            }
            if(!_.isEmpty(result)){
                var arr = result[0].content;
                arr.push(
                    fields.content
                )
                db.changeMany('posts',{
                    query: {username: json.username},
                    update: {$set: {content: arr}}
                },(result_c) => {
                    rs.status(200);
                    rs.send(result_c)
                })
                
            }else{
                db.insertOne('posts',json, (err, result) => {
                    if(err){
                        rs.send('-3');
                        return 
                    }
                    rs.status(200);
                    rs.send('1')
                })
            }
        })
    })
}
// 删除一条数据
exports.deleteMany = function (rq, rs, n) {

    var form = new formidable.IncomingForm();
    form .parse(rq, function (err,fields, files){
        var username = fields.username;
        db.deleteMany('posts',{username},(err, result) => {
            if(err){
                console.log(err);
                rs.send('-3')
                return;
            }
            rs.status(200);
            rs.send('1');
        })
    })
    
}
