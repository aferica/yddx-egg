const Controller = require('egg').Controller

class VideoController extends Controller {
  constructor(ctx) {
    super(ctx)
  }

  // 获取所有新闻(分页/模糊)
  async index() {
    const { ctx, service } = this
    // 组装参数
    const payload = ctx.query
    // 调用 Service 进行业务处理
    const res = await service.videos.index(payload)
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

}

module.exports = VideoController