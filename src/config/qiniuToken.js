const qiniu = require('qiniu')

var accessKey = 'your access key'
var secretKey = 'your secret key'

let mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

let options = {
  scope: 'vue-blog',
  // returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize)}'
  // callbackBodyType: 'application/json'
}

let putPolicy = new qiniu.rs.PutPolicy(options)
let uploadToken=putPolicy.uploadToken(mac)

let config = new qiniu.conf.Config()
// 空间对应的机房
config.zone = qiniu.zone.Zone_z2
// 上传是否使用cdn加速
//config.useCdnDomain = true

// ******************

// let localFile = "/Users/jemy/Documents/qiniu.mp4"
let formUploader = new qiniu.form_up.FormUploader(config)
let putExtra = new qiniu.form_up.PutExtra()
// let key='test.mp4'
// 文件上传
let uploadToQiniu = (localFile,key)=>{
  formUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr,respBody,respInfo) {
    if (respErr) {
      console.log('qiniu error1')
      throw respErr
    }
    if (respInfo.statusCode == 200) {
      console.log(respBody)
      return respBody
    } else {
      console.log('qiniu error2')
      console.log(respInfo.statusCode)
      console.log(respBody)
    }
  });
}

module.exports=uploadToQiniu
