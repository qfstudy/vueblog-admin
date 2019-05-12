const router = require('koa-router')()
const mysqlModel = require('../mysql/mysql.js')
const moment = require('moment')
const showdown  = require('showdown') 
const converter = new showdown.Converter()

const checkSessionValue = require('../check/check.js').checkSessionValue

router.post('/writecheck', async (ctx) => {
  await checkSessionValue(ctx).then((res) => {
    console.log('========')
    console.log(res)
    console.log('========')
    ctx.body = res
  }, (error) => {
    console.log('==----===')
    console.log(error)
    console.log('==----===')
    if(error.code === 400){
      ctx.body={
        code: 400,
        message: '用户名错误'
      }
    }else{
      ctx.body=error
    }
  })
})

router.post('/write', async(ctx, next) => {
  let {title,content} = ctx.request.body
  // console.log('ctx.request.body'+title,content)
  let id = ctx.session.id
  let name = ctx.session.user
  let time = moment().format('YYYY-MM-DD HH:mm:ss')
  let avatar
  await mysqlModel.searchUser(ctx.session.user)
    .then(res => {
      // console.log("res[0]['avatar']+++++++")
      // console.log(res)
      // console.log("res[0]['avatar']+++++++")
      // console.log(res[0]['avatar'])
      avatar = res[0]['avatar']       
    })
  let newContent=converter.makeHtml(content).replace(/\n/gi,"<br/>")
  await mysqlModel.addArticle([name, title,newContent, content, id, time,avatar])
    .then(() => {
      ctx.body = {
        code: 200,
        message: '发布文章成功'
      }
    }).catch((err) => {
      console.log('发布失败'+err)
      ctx.body = {
        code: 400,
        message: err
      }
    })
})

module.exports=router