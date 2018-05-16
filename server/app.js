var express = require("express");
var app = express();

var router = require("./router/router.js");
var morgan = require('morgan');
var session = require('express-session');

//使用session
app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: true}));
app.use(morgan('short'));
app.use(express.static("./public"));

// home
app.get("/", router.showIndex); 

// rsume 
app.get("/resume", router.showRsume);

// 管理员登录接口
app.post('/admin',router.showAdmin);

// 注册接口
app.post('/register', router.setRegister)

// 获取用户列表
app.post('/customlist', router.getCustomList)

// 删除一个用户
app.post('/deleteCustom', router.deleteCustom)

// 获取数据
app.post('/leaveData',router.getLeaveData)

// 创建一条消息
app.post('/writeMany', router.writeMany)

// 删除一条数据
app.post('/deleteMany',router.deleteMany)



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

app.listen(8080);

