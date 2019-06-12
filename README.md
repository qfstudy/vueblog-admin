# vue-admin

技术栈：`vue2` + `vuex` + `vue-router` + `axios` + `sass` + `koa2` + `阿里字体图标` + `mysql`

前后端分离，前段主要是veu实现，后端主要是koa2实现。

[前端项目地址](https://github.com/qfstudy/vueblog-vue)

[后端项目地址](https://github.com/qfstudy/vueblog-admin)

[预览地址](http://vueblog.qifei.site/#/)

### 安装MySql数据库
首先需要在本地安装MySql数据库

### 登录数据库
`mysql -u root -p`

### 创建数据库
`create database vueblog`

### 下载项目到本地

后端代码：`git clone git@github.com:qfstudy/vueblog-admin.git`

前端代码：`git clone git@github.com:qfstudy/vueblog-vue.git`

### 运行后端项目

`cd vueblog-admin`

`npm i`

`node app.js`

### 运行前端项目

`cd vueblog-vue`

`npm i`

`npm run dev`

### 功能
1. 注册、登录、登出和验证码登录验证
2. 登录后可以上传头像和更换头像，以及填写个人博客、github地址等个人信息
3. 写博客，支持 markdown 语法，不支持上传图片，只能通过外链形式添加博客图片，写博客的同时还可以预览博客，实现代码高亮
4. 点赞、收藏和评论功能，在浏览博客页面可以对博客进行点赞、收藏和评论，也可以取消收藏、点赞以及删除评论
5. 编辑文章，可以对自己的文章进行编辑
6. 删除文章功能
7. 搜索功能，可以搜索存在的文章
8. 在个人主页可以看到个人填写的信息以及个人博客总共获得的点赞数量，收藏数和阅读数，还展示个人的文章

### 项目线上地址
预览: [vueblog](http://vueblog.qifei.site/#/)