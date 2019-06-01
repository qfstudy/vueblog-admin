const router = require('koa-router')()
const mysqlModel = require('../mysql/mysql.js')
const moment = require('moment')
const showdown  = require('showdown') 
const converter = new showdown.Converter()
const checkSessionValue = require('../check/check.js').checkSessionValue

router.post('/blog/write', async(ctx) => {
  let {title,content} = ctx.request.body
  // console.log('ctx.request.body'+title,content)
  let id = ctx.session.id
  let name = ctx.session.user
  let time = moment().format('YYYY-MM-DD HH:mm:ss')
  let avatar
  let newContent=converter.makeHtml(content).replace(/\n/gi,"<br/>")

  await checkSessionValue(ctx).then(async (res)=>{
    await mysqlModel.searchUser(ctx.session.user)
    .then(res => {
      avatar = res[0]['avatar']       
    })
    await mysqlModel.addArticle([name, title,newContent, content, id, time,avatar])
    .then(() => {
      ctx.body = {
        code: 200,
        message: '发布文章成功'
      }
    })
  }).catch((error)=>{
    ctx.body={
      code: 500,
      message: error
    }
  })
})

module.exports=router