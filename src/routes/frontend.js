const router = require('koa-router')()
const fs = require('fs')
const path=require('path')
const md5 = require('md5')
const moment = require('moment')
const mysqlModel = require('../mysql/mysqlApi.js')
const uploadToQiniu=require('../config/qiniuToken.js')
const checkSessionValue = require('../check/check.js').checkSessionValue
// 验证码
const captcha = require('trek-captcha')
const showdown  = require('showdown') 
const converter = new showdown.Converter()

// post 注册
router.post('/blog/signup', async(ctx) => {
  let {userName,password}=ctx.request.body
  await mysqlModel.findUserByName(userName)
    .then(async (result) => {
      if (result.length>0) {
        ctx.body = {
          code: 500,
          message: '用户名已注册'
        }  
      } else {      
        await mysqlModel.addUser(userName, md5(password), moment().format('YYYY-MM-DD'))
          .then(res=>{
            ctx.body = {
              code: 200,
              message: '注册成功'
            }
          })       
      }
    }) .catch((error)=>{
      console.log('signup: ',error)
			ctx.body = {
				code: 400,
				message: '注册失败',
				error: error
			}
    })
})

//登录
router.post('/blog/signin', async (ctx) => {
  let {userName,password} = ctx.request.body
  await mysqlModel.findUserByName(userName)
    .then(result => {
      if (result.length && userName === result[0]['userName'] && md5(password) === result[0]['password']) {
        ctx.session = {
          userName: result[0]['userName'],
          id: result[0]['id']
        }
        console.log('signin: ','登录成功')
        ctx.body = {
          code: 200,
          message: '登录成功'
        }
      } else {
        ctx.body = {
          code: 500,
          message: '用户名或密码错误'
        }
      }
    }).catch(error => {
      console.log('signin: ',err)
      ctx.body = {
        code: 400,
        message: '登录错误',
        error
      }
    })
})

// get 验证码
router.get('/blog/verifycode', async(ctx) => {
  const { token, buffer } = await captcha({
		size: 4
  })
  await new Promise((reslove, reject) => {
		fs.createWriteStream('./public/images/verifycode.jpg').on('finish', () => {
			reslove(true)
		}).end(buffer)
  }).then((res)=>{
    ctx.body = {
			code: 200,
			data: token,
			message: '获取验证码成功'
		}
  }).catch((error)=>{
    ctx.body = {
			code: 400,
			data: error,
			message: '获取验证码失败'
		}
  })
})

// 文章页 首页
router.get('/blog/allarticles',async(ctx)=>{
  await mysqlModel.getAllArticle()
    .then(result=>{
      result.forEach((item)=>{
        item.content=item.content.split('<pre>')[0].replace(/<[^>]+>/g,"").trim()
      })
      ctx.body={
        code: 200,
        articles: result
      }
    })  
    .catch((error)=>{
      console.log('allarticle error: ',error)
      ctx.body={
        code: 400,
        message: '获取全部文章失败',
        error
      }
    })
})

// 通过用户名查询用户信息 验证用户是否登录再获取返回
router.get('/blog/getuserinfo',async (ctx)=>{
  await checkSessionValue(ctx).then(async res=>{
    let userName=res.userName
    await mysqlModel.findUserByName(userName)
      .then(result => {
        let res=result[0]
        ctx.body = {
          code: 200,
          data: res,
          message: '查询用户信息成功'
        }
      })
  }).catch((error)=>{
    console.log('getuserinfo error: ',error)
    ctx.body={
      code: 400,
      message: '获取用户信息失败',
      error
    }
  }) 
})
// 登出
router.post('/blog/signout', async (ctx) => {
  ctx.session = null
  console.log('登出成功')
  ctx.body = {
    code: 200,
    message: '登出成功'
  }
})

// 写博客　保存
router.post('/blog/write', async(ctx) => {
  let {title,content} = ctx.request.body
  // console.log('ctx.request.body'+title,content)
  let id = ctx.session.id
  let name = ctx.session.userName
  let time = moment().format('YYYY-MM-DD HH:mm:ss')
  let newContent=converter.makeHtml(content).replace(/\n/gi,"<br/>")
  await checkSessionValue(ctx).then(async (res)=>{
    await mysqlModel.addArticle([name, title,newContent, content, id, time])
    .then((res) => {
      ctx.body = {
        code: 200,
        message: '发布文章成功'
      }
    })
  }).catch((error)=>{
    console.log('write error: ',error)
    ctx.body={
      code: 500,
      message: '发布文章失败',
      error
    }
  })
})

// 文章详情页
router.post('/blog/getanarticle', async(ctx) => {
  let articleId = ctx.request.body.articleId
  await mysqlModel.updateArticlePv(articleId).catch((error)=>{
    ctx.body=error
  })
  await mysqlModel.findArticleById(articleId)
    .then(async (res) => {
      if(res.length>0){
        ctx.body= {
          code: 200,
          data: res[0],
          message: '获取文章成功'
        }
      }else{
        ctx.body= {
          code: 300,
          data: res,
          message: '没有这篇文章'
        }
      }
    })
    .catch((error)=>{
      ctx.body={
        code: 400,
        message: '获取文章失败',
        error
      }
    })
})

// 删除文章
router.post('/blog/deleteanarticle', async(ctx) => {
  let articleId = ctx.request.body.articleId
  await checkSessionValue(ctx).then(async (res)=>{
    await mysqlModel.deleteArticleComment(articleId)
    await mysqlModel.deleteArticle(articleId)
      .then(() => {
        ctx.body = {
          code: 200,
          message: '删除成功'
        }
      })
  }).catch((error)=>{
    ctx.body={
      code: 400,
      message: '删除失败',
      error
    }
  })
})


// 保存评论 
router.post('/blog/saveusercomment', async(ctx, next) => {
  let userName = ctx.request.body.userName
  let content = ctx.request.body.content
  let articleId = ctx.request.body.articleId
  let time = moment().format('YYYY-MM-DD HH:mm:ss')
  let avatar
  // console.log('发布评论')
  await mysqlModel.findUserByName(userName)
    .then(res => {
      avatar = res[0]['avatar']
    }).catch((error)=>{
      ctx.body={
        code: 400,
        message: '添加评论获取头像失败',
        error
      }
    })

  await mysqlModel.addArticleCommentCount(articleId)
    .catch((error)=>{
      ctx.body={
        code: 400,
        message: '添加评论数失败',
        error
      }
    })
  await mysqlModel.addComment([userName, converter.makeHtml(content), time, articleId, avatar])
    .then(() => {
      ctx.body = {
        code:200,
        message:'发送成功'
      }
    }).catch((error) => {
      ctx.body = {
        code: 500,
        message: '发送评论失败',
        error
      }
    })    
})

// 获取评论
router.post('/blog/getallcomment', async(ctx) => {
  let articleId = ctx.request.body.articleId
  await mysqlModel.findCommentByArticleId(articleId)
    .then(res => {
      ctx.body= {
        code: 200,
        data: res,
        message: '获取评论成功'
      }
    }).catch((error)=>{
      ctx.body={
        code: 400,
        message: '获取评论失败'
      }
    })
})

// 删除评论
router.post('/blog/deleteusercomment', async(ctx) => {
  let articleId = ctx.request.body.articleId
  let commentId = ctx.request.body.commentId
 
  await mysqlModel.reduceArticleCommentCount(articleId)
  await mysqlModel.deleteComment(commentId)
    .then(() => {
      ctx.body = {
        code: 200,
        message: '删除评论成功'
      }
    }).catch((error) => {
      ctx.body = {
        code: 500,
        message: '删除评论失败',
        error:error
      }
    }) 
})


module.exports=router