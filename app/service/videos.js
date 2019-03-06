const Service = require('egg').Service

class VideoService extends Service {

  async index(payload) {

    let { type, page, limit } = payload

    page = Number(page) - 1 || 0
    limit = Number(limit) || 10
    let query = {}
    if(type!=null) {
      query.type = type
    }
    const results = await this.app.mysql.select('videos',{
      where: query,
      limit: limit,
      offset: page * limit
    })
    // console.log(results)
    return results
  }

  // show======================================================================================================>
  async show(_id) {
    const video = await this.app.mysql.get('videos', { id: _id })
    if (!video) {
      this.ctx.throw(404, 'video not found')
    }
    return video
  }
}

module.exports = VideoService