const Controller = require('egg').Controller

class NewsController extends Controller {
  constructor(ctx) {
    super(ctx)
  }

  // 获取所有新闻(分页/模糊)
  async index() {
    const { ctx, service } = this
    // 组装参数
    const payload = ctx.query
    // 调用 Service 进行业务处理
    const res = await service.news.index(payload)
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

  // 获取单个新闻
  async show() {
    const { ctx, service } = this
    // 调用 Service 进行业务处理
    const res = await service.news.show(ctx.query.id)
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }
}

module.exports = NewsController