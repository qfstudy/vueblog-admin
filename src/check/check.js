const mysqlModel = require('../mysql/mysqlApi.js')

module.exports ={
  checkSessionValue:async (ctx)=>{
    let cookie=ctx.cookies.get('BLOG_USER')
    // console.log('checkSessionValue: ',cookie)
    let sessionId=`BLOG_USER:${cookie}`
    let checkResult
    await mysqlModel.findSession(sessionId).then(async (res)=>{
      if(res.length<1){
        checkResult=null
        return
      }else{
        let resultData=JSON.parse(res[0].data)
        let userName=resultData.userName
        await mysqlModel.findUserByName(userName).then((res)=>{
          if(res.length>0){
            checkResult=res[0].userName
          }else{
            checkResult=null
          }          
        })
      }      
    }).catch((error)=>{
      console.log('checkSessionValue:没有seesion: ',error)      
    })

    return new Promise((resolve,reject)=>{
      if(!cookie){
        reject ({
          code: 500,
          message: '无效的用户权限，请重新登录'
        })
      }
      if(!checkResult){
        reject ({
          code: 400,
          message: '用户权限过期，请重新登录'
        })
      }else{   
        console.log('登录验证成功: ',checkResult) 
        resolve ({
          code: 200,
          message: '登录验证成功',
          userName: checkResult
        })        
      }
    })
  }
}
