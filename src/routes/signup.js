const router = require('koa-router')()
const mysqlModel = require('../mysql/mysql.js')
const md5 = require('md5')
const moment = require('moment')
const fs = require('fs')
const path=require('path')
const uploadToQiniu=require('../config/qiniuToken.js')

// post 注册
router.post('/blog/signup', async(ctx) => {
  let {userName,password,avatar}=ctx.request.body
  await mysqlModel.searchUserByName(userName)
    .then(async (result) => {
      if (result.length>0) {
        ctx.body = {
          code: 400,
          message: '用户名已注册'
        }  
      } else {      
      let base64Data = avatar.replace(/^data:image\/\w+;base64,/, "")
      let dataBuffer = Buffer.from(base64Data, 'base64')
     
      let setImageName = Number(Math.random().toString().substr(3)).toString(36) + Date.now()
     
      await fs.writeFile('./public/images/' + setImageName + '.png', dataBuffer, err => { 
        if (err) {
          console.log('signup png:')
          console.log(err)
        }
      })

      let localFile = path.resolve(__dirname, '../../public/images/')+ '/' + setImageName + '.png'
      let key=`${setImageName}.png`
      
      //上传到七牛
      await uploadToQiniu(localFile,key)

      //删除写入到本地的图片
      fs.unlink(localFile, function(err) {
        if (err) throw err
        console.log('文件删除成功')
      })

      let qiniuUrl = `http://qiniu.qifei.site/${key}`

      await mysqlModel.addUser([userName, md5(password), qiniuUrl, moment().format('YYYY-MM-DD HH:mm:ss')])
        .then(res=>{
          ctx.body = {
            code: 200,
            message: '注册成功'
          }
        })
       
      }
    }) .catch((err)=>{
      console.log('signup: ')
      console.log(err)
      ctx.body={
        code: 500,
        message: err
      }
    })
})

module.exports=router