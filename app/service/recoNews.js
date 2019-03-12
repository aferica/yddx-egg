const Service = require('egg').Service

class RecoNewsService extends Service {

  async index(payload) {

    let { type, page, limit } = payload

    page = Number(page) - 1 || 0
    limit = Number(limit) || 10
    let params = {}
    if(type) {
      params[type] = 1
    }
    // console.log(params)
    const results = await this.app.mysql.select('reco_news',{
      where: params,
      columns: ['reco_id', 'reco_title', 'reco_source_name', 'reco_images'],
      orders: [['reco_time','desc'], ['reco_id','desc']],
      limit: limit,
      offset: page * limit
    })
    // console.log(results)
    return results
  }

  // show======================================================================================================>
  async show(payload) {
    const reco_news = await this.app.mysql.get('reco_news', { reco_id: payload.news_id })
    if (!reco_news) {
      this.ctx.throw(404, 'reco_news not found')
    }
    const insetReadHistory = await this.service.recoNews.insetReadHistory(payload)
    if (!insetReadHistory) {
      this.ctx.throw(404, '创建记录失败，请重试')
    }
    reco_news.reco_read_num = await this.service.recoNews.getReadUserNumber(payload.news_id)
    reco_news.read_users = await this.service.recoNews.getReadUserId(payload.news_id)
    return reco_news
  }

  // 获取reco_news阅读人数
  async getReadUserNumber(id) {
    const count = await this.app.mysql.count('reco_news_read', { reco_news_id: id })
    return count
  }

  // 获取reco_news最近阅读用户id
  async getReadUserId(id) {
    const users = await this.app.mysql.select('reco_news_read', {
      where: { reco_news_id: id },
      columns: ['user_id'],
      orders: [['create','desc']],
      limit: 10,
    })
    let data = users.map((e) => {
      return e.user_id
    })

    return data
  }

  // 查询时添加查询历史
  async insetReadHistory(payload) {
    const result = await this.app.mysql.insert('reco_news_read', { 
      user_id: parseInt(payload.user_id),
      reco_news_id: parseInt(payload.news_id),
      create: this.ctx.helper.formatTime(Date.now())
    })
    return result.affectedRows === 1
  }
}

module.exports = RecoNewsService