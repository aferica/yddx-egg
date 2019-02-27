const Service = require('egg').Service
const rp = require('request-promise')
const md5 = require('js-md5')

class WeappService extends Service {
  async check(code) {
    const { ctx, app } = this
    // 获取openid
    const options = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      qs: {
        grant_type: 'authorization_code',
        js_code: code,
        secret: app.config.weapp.appSecret,
        appid: app.config.weapp.appId,
      },
    }

    const sessionDataString = await rp(options)
    const sessionData = JSON.parse(sessionDataString)
    
    if (!sessionData.openid) {
      ctx.throw(-1, '登录失败')
    }
    let result 
    const res = await app.mysql.get('user', { open_id: md5(sessionData.openid) })
    if (res) {
      delete res.password
      result = {
        code: 0,
        res: res,
        msg: '请求成功'
      }
    } else {
      result = {
        code: 101,
        res: md5(sessionData.openid),
        msg: '尚未注册'
      }
    }

    return result
  }
}

module.exports = WeappService