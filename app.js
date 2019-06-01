const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const path = require('path')
const session = require('koa-session-minimal')
const mysqlStore = require('koa-mysql-session')
const static = require('koa-static')
const cors=require('koa2-cors')

const mysqlConfig = require('./src/config/config.js')

const app = new Koa()


// 静态资源目录路径
app.use(static(
  path.join(__dirname, './public')
))

// 存放sessionId的cookie配置
let cookie = {
  path: '/', 
  httpOnly: true,
  // 毫秒为单位
  maxAge: 1000*60*60*2
}

// session存储配置
const store = new mysqlStore({
  user: mysqlConfig.database.USERNAME,
  password: mysqlConfig.database.PASSWORD,
  database: mysqlConfig.database.DATABASE,
  host: mysqlConfig.database.HOST,
})

app.use(session({
  key: 'BLOG_USER',
  store,
  cookie
}))

app.use(bodyParser({
  formLimit: '1mb',
  jsonLimit:"3mb"
}))

app.use(async (ctx,next)=>{
  if (ctx.method === 'OPTIONS') {
    ctx.body = ''
  }
  ctx.set('Access-Control-Allow-Origin', 'http://localhost:8080')
  ctx.set("Access-Control-Allow-Headers", "x-requested-with, accept, origin, content-type")
  //使用axios时需要前后端设置credentials，否则请求并没有带cookie。
  //使用Access-Control-Allow-Credentials时，Access-Control-Allow-Origin值只能是一个域名
  ctx.set('Access-Control-Allow-Credentials', true)
  ctx.set('Access-Control-Allow-Methods','*')
  ctx.set('Access-Control-Allow-Headers', 'Content-Type,Access-Token,Authorization,Accept')
  await next()
})

//路由
app.use(require('./src/routes/frontend.js').routes())
// app.use(require('./src/routes/signup.js').routes())
// app.use(require('./src/routes/signin.js').routes())
// app.use(require('./src/routes/signout.js').routes())
// app.use(require('./src/routes/allArticle.js').routes())
app.use(require('./src/routes/writeArticle.js').routes())
app.use(require('./src/routes/article.js').routes())
app.use(require('./src/routes/comment.js').routes())
app.use(require('./src/routes/editArticle.js').routes())
app.use(require('./src/routes/user.js').routes())


app.listen(5000)

console.log(`listening on port ${mysqlConfig.port}`)