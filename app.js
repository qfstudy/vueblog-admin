const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const path = require('path')
const session = require('koa-session-minimal')
const mysqlStore = require('koa-mysql-session')
const static = require('koa-static')
const cors=require('koa2-cors')

const mysqlConfig = require('./src/config/config.js')

const app = new Koa()

//cors
app.use(cors({
  origin: function(ctx){
    if(ctx.url === '/test'){
      return '*'
    }
    // 可以通过
    // sessionOptions.cookie.domain = ctx.request.hostname
    //动态设置跨域
    return 'http://localhost:8080'
    // return '*'
  },
  //使用axios时需要前后端设置credentials，否则请求并没有带cookie
  credentials: true,
  //带有cookie
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'] 
}))

// 静态资源目录路径
app.use(static(
  path.join(__dirname, './public')
))

// 存放sessionId的cookie配置
let cookie = {
  domain: 'localhost',
  path: '/', 
  httpOnly: false,
  expires: false,
  // maxAge: 60*60*60*24
}

// session存储配置
const store = new mysqlStore({
  user: mysqlConfig.database.USERNAME,
  password: mysqlConfig.database.PASSWORD,
  database: mysqlConfig.database.DATABASE,
  host: mysqlConfig.database.HOST,
})

// app.use(async (ctx, next) => {
  // 获取hostname，设置cookie的domain属性值
  // console.log(ctx.request.hostname)
  // sessionOptions.cookie.domain = ctx.request.hostname
  // await next()
// })

app.use(session({
  key: 'USERS_ID',
  store,
  cookie
}))

app.use(bodyParser({
  formLimit: '1mb',
  jsonLimit:"3mb",　//图片上传大小限制设置
  // textLimit:"3mb",
  // enableTypes: ['json', 'form', 'text']
}))

//路由
app.use(require('./src/routers/signup.js').routes())
app.use(require('./src/routers/signin.js').routes())
app.use(require('./src/routers/checklogin.js').routes())
app.use(require('./src/routers/signout.js').routes())
app.use(require('./src/routers/allArticle.js').routes())
app.use(require('./src/routers/writeArticle.js').routes())
app.use(require('./src/routers/article.js').routes())
app.use(require('./src/routers/comment.js').routes())
app.use(require('./src/routers/editArticle.js').routes())
app.use(require('./src/routers/user.js').routes())

app.listen(mysqlConfig.port)

console.log(`listening on port ${mysqlConfig.port}`)