const Service = require('egg').Service

class UserService extends Service {
  // create======================================================================================================>
  async create(payload) {
    const { ctx, app } = this
    payload.weixin_name = payload.weixin_name || ''
    payload.sex = payload.sex || 0
    payload.open_id = payload.open_id || ''
    payload.learn_time = 0
    payload.password = '96e79218965eb72c92a549dd5a330112'
    const result = await app.mysql.insert('user',  payload )
    return result.affectedRows === 1
  }

  // destroy======================================================================================================>  
  async destroy(_id) {
    const { ctx, service } = this
    const user = await ctx.service.user.find(_id)
    if (!user) {
      ctx.throw(404, 'user not found')
    }
    return ctx.model.User.findByIdAndRemove(_id)
  }

  // update======================================================================================================>
  async update(_id, payload) {
    const { ctx, service } = this
    const user = await ctx.service.user.find(_id)
    if (!user) {
      ctx.throw(404, 'user not found')
    }
    return ctx.model.User.findByIdAndUpdate(_id, payload)
  }

  // show======================================================================================================>
  async show(_id) {
    const user = await this.ctx.service.user.find(_id)
    if (!user) {
      this.ctx.throw(404, 'user not found')
    }
    return this.ctx.model.User.findById(_id).populate('role')
  }

  // index======================================================================================================>
  async index(payload) {
    const { currentPage, pageSize, isPaging, search } = payload
    let res = []
    let count = 0
    let skip = ((Number(currentPage)) - 1) * Number(pageSize || 10)
    if(isPaging) {
      if(search) {
        res = await this.ctx.model.User.find({mobile: { $regex: search } }).populate('role').skip(skip).limit(Number(pageSize)).sort({ createdAt: -1 }).exec()
        count = res.length
      } else {
        res = await this.ctx.model.User.find({}).populate('role').skip(skip).limit(Number(pageSize)).sort({ createdAt: -1 }).exec()
        count = await this.ctx.model.User.count({}).exec()
      }
    } else {
      if(search) {
        res = await this.ctx.model.User.find({mobile: { $regex: search } }).populate('role').sort({ createdAt: -1 }).exec()
        count = res.length
      } else {
        res = await this.ctx.model.User.find({}).populate('role').sort({ createdAt: -1 }).exec()
        count = await this.ctx.model.User.count({}).exec()
      }
    }
    // 整理数据源 -> Ant Design Pro
    let data = res.map((e,i) => {
      const jsonObject = Object.assign({}, e._doc)
      jsonObject.key = i
      jsonObject.password = 'Are you ok?'
      jsonObject.createdAt = this.ctx.helper.formatTime(e.createdAt)
      return jsonObject
    })

    return { count: count, list: data, pageSize: Number(pageSize), currentPage: Number(currentPage) }
  }  

  async getReport(userid) {
    const { ctx, service, app } = this

    let sql1 = 'SELECT  ' + 
      'COUNT(1) AS sum,  ' +
      'COUNT(if(qu.question_type = "党性修养",true, null)) AS type_1,  ' +
      'COUNT(if(qu.question_type = "时政",true, null)) AS type_2,  ' +
      'COUNT(if(qu.question_type = "行政能力",true, null)) AS type_3,  ' +
      'COUNT(if(qu.question_type = "行政素养",true, null)) AS type_4,  ' +
      'COUNT(if(qu.question_type = "党史",true, null)) AS type_5  ' +
      'FROM qa qa  ' +
      'LEFT JOIN question qu ON qu.question_id = qa.question_id  ' +
      'WHERE user_id = ' + parseInt(userid)
    
    const result1 = await app.mysql.query(sql1)

    let sum_result = result1[0]

    const sql2 = 'SELECT  ' + 
      'count(1) AS sum_user,  ' +
      'count(if(learn_time < (  ' +
      '	SELECT learn_time  ' +
      ' FROM user  ' +
      '	WHERE user_id =  ' + parseInt(userid) +
      '),true, null)) AS less_user  ' +
      'FROM user  '

    const result2 = await app.mysql.query(sql2)
      
    let reportResult = getReportResult(sum_result)
    sum_result.sum_user = result2[0].sum_user, 
    sum_result.less_user = result2[0].less_user
    sum_result.result = reportResult.result
    sum_result.rank = reportResult.rank
    
    return sum_result
  }
}


module.exports = UserService


function getReportResult(sum_result) {
  if(sum_result.type_1 + sum_result.type_2 + sum_result.type_3 + sum_result.type_4 + sum_result.type_5 == 0) {
    return {
      result: '你尚未开始学习，请努力！',
      rank: []
    }
  }

  let type1 = {
    high: '党的性质、党的思想、党的宗旨、党的纲领、党的光辉历程等知识',
    med: '党的思想理论知识',
  }

  let type2 = {
    high: '马克思主义的理论修养、政治修养、思想道德修养、业务修养、作风修养、组织纪律修养等知识',
    med: '党性锻炼、树立正确的世界观、坚定正确立场、锤炼自身的思想品德等内容',
  }

  let type3 = {
    high: '当前国际形势、国家发展战略、国家政策实施等内容',
    med: '国内外发展新形势、新时代新战略等知识',
  }

  let type4 = {
    high: '行政环境、行政组织、行政职能、人事行政、行政职业能力等知识',
    med: '行政的概念、行政人员的含义、行政职能和组织的相关内容等知识',
  }

  let type5 = {
    high: '行政素养概念、行政职能含义、行政人员角色、行政素养要求等知识',
    med: '行政的概念、行政领导方法、行政方式和艺术、行政人员的素质结构等知识',
  }

  let temp = [
    {name: '党性修养',value: sum_result.type_1, type: type1},
    {name: '时政',value: sum_result.type_2, type: type2},
    {name: '行政能力',value: sum_result.type_3, type: type3},
    {name: '行政素养',value: sum_result.type_4, type: type4},
    {name: '党史',value: sum_result.type_5, type: type5},
  ]

  temp.sort(keysort)

  let height_type = temp[0].name + '和' + temp[1].name
  let med_type = temp[2].name + '和' + temp[3].name
  let low_type = temp[4].name
  
  let result_high_first = '本次学习后，您在' + height_type + '能力方面十分勤奋。对于'
  let result_high_end = '，您已经非常熟悉，请保持这种认真学习的好习惯！\n\u3000\u3000'
  let result_med_first = '此外，您在' + med_type + '问题方面有了相当的积累。对于'
  let result_med_end = '，您已基本了解，请继续努力，不断加强对' + med_type + '的学习！\n\u3000\u3000'
  let result_low = '在本次的学习中，您尚未学习' + low_type + '专题，建议您下次学习时，在' + low_type + '领域投入更多的学习时间，加油哦！'


  let result = result_high_first + temp[0].type.high + '，以及' +
    temp[1].type.high + result_high_end + result_med_first +
    temp[2].type.med + '，还有' + temp[3].type.med + result_med_end
    + result_low

  let returnRes = {
    result: result,
    rank: [temp[0].name,temp[1].name,temp[2].name,temp[3].name,temp[4].name]
  }

  return returnRes
}


function keysort(a, b){
  return b.value - a.value
}

