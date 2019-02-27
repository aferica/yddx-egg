const Controller = require('egg').Controller
const rp = require('request-promise')
const md5 = require('js-md5')

class WeappController extends Controller {
  async check() {
    const { ctx, service } = this
    const { code } = ctx.params
    
    if (code == null || code === '') {
      ctx.body = { code: -1, msg: 'code不能为空' }
    }
    const res = await service.weapp.check(code)
    
    ctx.helper.successOther({ctx, code: res.code, res: res.res, msg: res.msg})
  }
}

module.exports = WeappController
