const Service = require('egg').Service

class NewsService extends Service {

  async index(payload) {

    let { type, page, limit } = payload

    page = Number(page) - 1 || 0
    limit = Number(limit) || 10
    let params = {}
    if(type) {
      params[type] = 1
    }
    // console.log(params)
    const results = await this.app.mysql.select('news',{
      where: params,
      orders: [['create_time','desc'], ['id','desc']],
      limit: limit,
      offset: page * limit
    })
    // console.log(results)
    return results
  }

  // show======================================================================================================>
  async show(_id) {
    const news = await this.app.mysql.get('news', { id: _id })
    if (!news) {
      this.ctx.throw(404, 'news not found')
    }
    return news
  }
}

module.exports = NewsService