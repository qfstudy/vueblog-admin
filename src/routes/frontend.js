const router = require("koa-router")();
const fs = require("fs");
const path = require("path");
const md5 = require("md5");
const moment = require("moment");
const mysqlModel = require("../mysql/mysqlApi.js");
const checkSessionValue = require("../check/check.js").checkSessionValue;
// 验证码
const captcha = require("trek-captcha");
const showdown = require("showdown");
const converter = new showdown.Converter();

// post 注册
router.post("/blog/signup", async ctx => {
  let { userName, password } = ctx.request.body;
  await mysqlModel
    .findUserByName(userName)
    .then(async result => {
      if (result.length > 0) {
        ctx.body = {
          code: 500,
          message: "用户名已注册"
        };
      } else {
        await mysqlModel
          .addUser(userName, md5(password), moment().format("YYYY-MM-DD"))
          .then(res => {
            ctx.body = {
              code: 200,
              message: "注册成功"
            };
          });
      }
    })
    .catch(error => {
      console.log("signup: ", error);
      ctx.body = {
        code: 400,
        message: "注册失败",
        error: error
      };
    });
});

//登录
router.post("/blog/signin", async ctx => {
  let { userName, password } = ctx.request.body;
  await mysqlModel
    .findUserByName(userName)
    .then(result => {
      if (
        result.length &&
        userName === result[0]["userName"] &&
        md5(password) === result[0]["password"]
      ) {
        ctx.session = {
          userName: result[0]["userName"],
          id: result[0]["id"]
        };
        // console.log("signin: ", "登录成功");
        ctx.body = {
          code: 200,
          message: "登录成功"
        };
      } else {
        ctx.body = {
          code: 500,
          message: "用户名或密码错误"
        };
      }
    })
    .catch(error => {
      console.log("signin: ", err);
      ctx.body = {
        code: 400,
        message: "登录错误",
        error
      };
    });
});

// get 验证码
router.get("/blog/verifycode", async ctx => {
  const { token, buffer } = await captcha({
    size: 4
  });
  await new Promise((reslove, reject) => {
    fs.createWriteStream("./public/images/verifycode.jpg")
      .on("finish", () => {
        reslove(true);
      })
      .end(buffer);
  })
    .then(res => {
      ctx.body = {
        code: 200,
        data: token,
        message: "获取验证码成功"
      };
    })
    .catch(error => {
      ctx.body = {
        code: 400,
        data: error,
        message: "获取验证码失败"
      };
    });
});

// 文章页 首页
router.get("/blog/allarticles", async ctx => {
  await mysqlModel
    .getAllArticle()
    .then(result => {
      result.forEach(item => {
        item.content = item.content
          .split("<pre>")[0]
          .replace(/<[^>]+>/g, "")
          .trim();
      });
      ctx.body = {
        code: 200,
        articles: result
      };
    })
    .catch(error => {
      console.log("allarticle error: ", error);
      ctx.body = {
        code: 400,
        message: "获取全部文章失败",
        error
      };
    });
});

// 通过用户名查询用户信息 验证用户是否登录再获取返回
router.get("/blog/getuserinfo", async ctx => {
  await checkSessionValue(ctx)
    .then(async res => {
      let userName = res.userName;
      await mysqlModel.findUserByName(userName).then(result => {
        let res = result[0];
        ctx.body = {
          code: 200,
          data: res,
          message: "查询用户信息成功"
        };
      });
    })
    .catch(error => {
      console.log("getuserinfo error: ", error);
      ctx.body = {
        code: 400,
        message: "获取用户信息失败",
        error
      };
    });
});

// 通过用户名查询用户信息 用户信息页面
router.post("/blog/getusernosignin", async ctx => {
  let userName = ctx.request.body.userName
  await mysqlModel.findUserByName(userName).then(result => {
    let res = result[0];
    ctx.body = {
      code: 200,
      data: res,
      message: "获取用户信息成功"
    };
  }).catch(error => {
    console.log("getusernosignin error: ", error);
    ctx.body = {
      code: 400,
      message: "获取用户信息失败",
      error
    };
  });
});

// 登出
router.post("/blog/signout", async ctx => {
  ctx.session = null;
  console.log("登出成功");
  ctx.body = {
    code: 200,
    message: "登出成功"
  };
});

// 写博客　保存
router.post("/blog/write", async ctx => {
  let { userName, avatar, title, content } = ctx.request.body;
  // console.log('ctx.request.body'+title,content)
  let id = ctx.session.id;
  let time = moment().format("YYYY-MM-DD HH:mm:ss");
  let newContent = converter.makeHtml(content).replace(/\n/gi, "<br/>");
  await checkSessionValue(ctx)
    .then(async res => {
      await mysqlModel
        .addArticle([userName, title, newContent, content, id, time, avatar])
        .then(res => {
          ctx.body = {
            code: 200,
            message: "发布文章成功"
          };
        });
    })
    .catch(error => {
      console.log("write error: ", error);
      ctx.body = {
        code: 500,
        message: "发布文章失败",
        error
      };
    });
});

// 文章详情页
router.post("/blog/getanarticle", async ctx => {
  let articleId = ctx.request.body.articleId;
  await mysqlModel.updateArticlePv(articleId).catch(error => {
    ctx.body = error;
  });
  await mysqlModel
    .findArticleById(articleId)
    .then(async res => {
      if (res.length > 0) {
        ctx.body = {
          code: 200,
          data: res[0],
          message: "获取文章成功"
        };
      } else {
        ctx.body = {
          code: 300,
          data: res,
          message: "没有这篇文章"
        };
      }
    })
    .catch(error => {
      ctx.body = {
        code: 400,
        message: "获取文章失败",
        error
      };
    });
});

// 删除文章
router.post("/blog/deleteanarticle", async ctx => {
  let articleId = ctx.request.body.articleId;
  await checkSessionValue(ctx)
    .then(async res => {
      await mysqlModel.deleteArticleComment(articleId);
      await mysqlModel.deleteCollectionById(articleId);
      await mysqlModel.deleteLikeById(articleId);
      await mysqlModel.deleteArticle(articleId).then(() => {
        ctx.body = {
          code: 200,
          message: "删除成功"
        };
      });
    })
    .catch(error => {
      ctx.body = {
        code: 400,
        message: "删除失败",
        error
      };
    });
});

// 保存评论
router.post("/blog/saveusercomment", async (ctx, next) => {
  let { userName, avatar, content, articleId } = ctx.request.body;
  let time = moment().format("YYYY-MM-DD HH:mm:ss");
  await mysqlModel.addArticleCommentCount(articleId).catch(error => {
    ctx.body = {
      code: 400,
      message: "添加评论数失败",
      error
    };
  });
  await mysqlModel
    .addComment([
      userName,
      converter.makeHtml(content),
      time,
      articleId,
      avatar
    ])
    .then(() => {
      ctx.body = {
        code: 200,
        message: "发送成功"
      };
    })
    .catch(error => {
      ctx.body = {
        code: 500,
        message: "发送评论失败",
        error
      };
    });
});

// 获取评论
router.post("/blog/getallcomment", async ctx => {
  let articleId = ctx.request.body.articleId;
  await mysqlModel
    .findCommentByArticleId(articleId)
    .then(res => {
      ctx.body = {
        code: 200,
        data: res,
        message: "获取评论成功"
      };
    })
    .catch(error => {
      ctx.body = {
        code: 400,
        message: "获取评论失败"
      };
    });
});

// 删除评论
router.post("/blog/deleteusercomment", async ctx => {
  let articleId = ctx.request.body.articleId;
  let commentId = ctx.request.body.commentId;

  await mysqlModel.reduceArticleCommentCount(articleId);
  await mysqlModel
    .deleteComment(commentId)
    .then(() => {
      ctx.body = {
        code: 200,
        message: "删除评论成功"
      };
    })
    .catch(error => {
      ctx.body = {
        code: 500,
        message: "删除评论失败",
        error: error
      };
    });
});

// 编辑单篇文章页面
router.post("/blog/getedit", async ctx => {
  let articleId = ctx.request.body.articleId;
  await checkSessionValue(ctx)
    .then(async res => {
      await mysqlModel.findByArticleId(articleId).then(result => {
        ctx.body = {
          code: 200,
          message: "编辑成功",
          data: result[0]
        };
      });
    })
    .catch(error => {
      ctx.body = {
        code: 400,
        message: "编辑失败",
        error
      };
    });
});

// 保存编辑单篇文章
router.post("/blog/saveeditarticle", async ctx => {
  let title = ctx.request.body.title;
  let content = ctx.request.body.content;
  let articleId = ctx.request.body.articleId;
  let newContent = converter.makeHtml(content).replace(/\n/gi, "<br/>");
  await checkSessionValue(ctx)
    .then(async res => {
      await mysqlModel
        .updateArticle([title, newContent, content, articleId])
        .then(res => {
          ctx.body = {
            code: 200,
            message: "保存成功"
          };
        });
    })
    .catch(error => {
      ctx.body = {
        code: 400,
        message: "保存失败",
        error
      };
    });
});

//上传头像
router.post("/blog/uploadavatar", async ctx => {
  // console.log("avatar", ctx.request.body.userName);
  let { userName, avatar } = ctx.request.body;
  let base64Data = avatar.replace(/^data:image\/\w+;base64,/, "");
  let dataBuffer = new Buffer.from(base64Data, "base64");
  let setImageName =
    "avatar" +
    Number(
      Math.random()
        .toString()
        .substr(3)
    ).toString(36) +
    Date.now() +
    ".png";
  await checkSessionValue(ctx)
    .then(async res => {
      await mysqlModel.findUserByName(userName).then(async res => {
        if (res.length > 0 && res[0].avatar) {
          let oldAvatar = res[0].avatar;
          // let oldLocalFile=path.resolve(__dirname, '../public/images/')+ '/' + oldAvatar + '.png'
          fs.unlink("./public/images/avatar/" + oldAvatar, function(err) {
            if (err) {
              console.log(err);
            }
            console.log("旧头像删除成功");
          });
        }
        // let localFile = path.resolve(__dirname, '../public/images/')+ '/' + setImageName + '.png'
        await Promise.all([
          mysqlModel.uploadAvatar([setImageName, userName]),
          mysqlModel.uploadCommentAvatar([setImageName, userName]),
          mysqlModel.uploadArticleAvatar([setImageName, userName])
        ]).then(res => {
          console.log("上传成功");
          ctx.body = {
            code: 200,
            avatar: setImageName,
            message: "上传成功"
          };
        });
        await fs.writeFile(
          "./public/images/avatar/" + setImageName,
          dataBuffer,
          async err => {
            if (err) {
              console.log(err);
            }
          }
        );
      });
    })
    .catch(err => {
      console.log(err);
      ctx.body = {
        code: 500,
        message: "上传失败",
        err
      };
    });
});

// 点赞
router.post("/blog/addlike", async ctx => {
  let { userName, articleId } = ctx.request.body;
  await checkSessionValue(ctx)
    .then(async res => {
      await mysqlModel.reduceArticlePv(articleId).catch(error => {
        ctx.body = error;
      });
      await mysqlModel
        .findLikeByUserAid(userName, articleId)
        .then(async res => {
          if (res.length > 0) {
            await mysqlModel.reduceLikeNum(articleId).then(async res => {
              ctx.body = true;
            });
            await mysqlModel.deleteLike(userName, articleId).then(res => {
              ctx.body = {
                code: 200,
                message: "取消点赞"
              };
            });
          } else {
            await mysqlModel.increaseLikeNum(articleId).then(async res => {
              ctx.body = true;
            });
            await mysqlModel.addLike([userName, articleId]).then(() => {
              ctx.body = {
                code: 200,
                message: "点赞成功"
              };
            });
          }
        });
    })
    .catch(error => {
      console.log("like error: ", error);
      ctx.body = {
        code: 400,
        message: "点赞失败",
        error
      };
    });
});

// 获取点赞
router.post("/blog/getlike", async ctx => {
  let { userName, articleId } = ctx.request.body;
  // console.log("获取点赞", ctx.request.body);
  await checkSessionValue(ctx)
    .then(async res => {
      await mysqlModel.findLikeByUserAid(userName, articleId).then(res => {
        // console.log("获取点赞", res);
        ctx.body = {
          code: 200,
          data: res[0]
        };
      });
    })
    .catch(error => {
      console.log("获取点赞失败", error);
      ctx.body = {
        code: 400,
        message: "获取点赞失败"
      };
    });
});

// 收藏
router.post("/blog/addcollection", async ctx => {
  let { userName, articleId } = ctx.request.body;
  await checkSessionValue(ctx)
    .then(async res => {
      await mysqlModel.reduceArticlePv(articleId).catch(error => {
        ctx.body = error;
      });
      await mysqlModel
        .findCollectionByUserAid(userName, articleId)
        .then(async res => {
          if (res.length > 0) {
            await mysqlModel.reduceCollectionNum(articleId).then(async res => {
              ctx.body = true;
            });
            await mysqlModel.deleteCollection(userName, articleId).then(res => {
              ctx.body = {
                code: 200,
                message: "取消收藏"
              };
            });
          } else {
            await mysqlModel
              .increaseCollectionNum(articleId)
              .then(async res => {
                ctx.body = true;
              });
            await mysqlModel.addCollection([userName, articleId]).then(() => {
              ctx.body = {
                code: 200,
                message: "收藏成功"
              };
            });
          }
        });
    })
    .catch(error => {
      console.log("like error: ", error);
      ctx.body = {
        code: 400,
        message: "收藏失败",
        error
      };
    });
});

// 获取收藏
router.post("/blog/getcollection", async ctx => {
  let { userName, articleId } = ctx.request.body;
  await checkSessionValue(ctx)
    .then(async res => {
      await mysqlModel
        .findCollectionByUserAid(userName, articleId)
        .then(res => {
          // console.log("获取收藏", res);
          ctx.body = {
            code: 200,
            data: res[0]
          };
        });
    })
    .catch(error => {
      console.log("获取收藏失败", error);
      ctx.body = {
        code: 400,
        message: "获取收藏失败"
      };
    });
});

// 获取五篇文章
router.post("/blog/getnewarticle", async ctx => {
  let { userName } = ctx.request.body;
  await mysqlModel
    .getNewArticle(userName)
    .then(res => {
      // console.log(res);
      ctx.body = {
        code: 200,
        message: "获取五篇文章成功",
        data: res
      };
    })
    .catch(error => {
      console.log(error);
      ctx.body = {
        code: 400,
        message: "获取五篇文章失败"
      };
    });
});

// 获取一个用户所有文章
router.post("/blog/userallarticle", async ctx => {
  let userName = ctx.request.body.userName;
  await mysqlModel
    .findArticleByUser(userName)
    .then(result => {
      result.forEach(item => {
        item.content = item.content
          .split("<pre>")[0]
          .replace(/<[^>]+>/g, "")
          .trim();
      });
      ctx.body = {
        code: 200,
        data: result
      };
    })
    .catch(error => {
      ctx.body = {
        code: 400,
        message: error
      };
    });
});

// 获取用户like
router.post("/blog/getalllike", async ctx => {
  let userName = ctx.request.body.userName;
  await mysqlModel
    .findLikeByUser(userName)
    .then(res => {
      // console.log(res);
      ctx.body = {
        code: 200,
        data: res,
        message: "获取个人点赞成"
      };
    })
    .catch(error => {
      ctx.body = {
        code: 400,
        message: error
      };
    });
});

// 获取用户collection
router.post("/blog/getallcollection", async ctx => {
  let userName = ctx.request.body.userName;
  await mysqlModel
    .findCollectionByUser(userName)
    .then(res => {
      // console.log(res);
      ctx.body = {
        code: 200,
        data: res,
        message: "获取个人收藏成功"
      };
    })
    .catch(error => {
      ctx.body = {
        code: 400,
        message: error
      };
    });
});

// 保存用户信息 avatar=?,github=?,blog=?,email=? where userName=?
router.post("/blog/saveuserinfo", async ctx => {
  // console.log(ctx.request.body)
  let { avatar, github, blog, email, userName } = ctx.request.body;
  await checkSessionValue(ctx)
    .then(async res => {
      await mysqlModel
        .updateUser([avatar, github, blog, email, userName])
        .then(res => {
          // console.log(res)
          ctx.body = {
            code: 200,
            message: "保存用户信息成功"
          };
        });
    })
    .catch(error => {
      console.log(error);
      ctx.body = {
        code: 400,
        message: "保存用户信息错误"
      };
    });
});

// 搜索文章 searchArticle
router.post("/blog/searcharticle", async ctx=>{
  let title=ctx.request.body.title
  await mysqlModel.searchArticle(title).then((res)=>{
    // console.log("search article: ",res)
    ctx.body={
      code: 200,
      message: "搜索成功",
      data: res
    }
  }).catch((error)=>{
    console.log('search error: ',error)
    ctx.body={
      code: 400,
      message: '搜索失败'
    }
  })
});

module.exports = router;
