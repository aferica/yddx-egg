const fs = require('fs')
const path = require('path')
const Controller = require('egg').Controller
const awaitWriteStream = require('await-stream-ready').write
const sendToWormhole = require('stream-wormhole')
// // const download = require('image-downloader')

class UploadController extends Controller {
  constructor (ctx){
    super(ctx)
  }

  async uploadUserPhoto() {
    const { ctx, app, service } = this

    const stream = await ctx.getFileStream()
    // console.log(stream._readableState.length)
    // 所有表单字段都能通过 `stream.fields` 获取到
    const extname = path.extname(stream.filename).toLowerCase() // 文件扩展名称
    // 构建图片名
    let fileName = Date.now() + extname

    let key = 'image/avater' + getKey() + fileName
    let result = await service.upload.stream_uploader(stream, key)
    if (result.statusCode == 200) {
      let res = 'https://' + result.Location
      ctx.helper.success({ctx, res})
    } else {
      ctx.throw(404, '文件上传失败，请重试')
    }
  }

  async uploadDangke() {
    const { ctx, app, service } = this

    const stream = await ctx.getFileStream()
    // console.log(stream._readableState.length)
    // 所有表单字段都能通过 `stream.fields` 获取到
    const extname = path.extname(stream.filename).toLowerCase() // 文件扩展名称
    // 构建图片名
    let fileName = Date.now() + extname

    let key = 'dangke' + getKey() + fileName
    let result = await service.upload.stream_uploader(stream, key)
    if (result.statusCode == 200) {
      let res = 'https://' + result.Location
      ctx.helper.success({ctx, res})
    } else {
      ctx.throw(404, '文件上传失败，请重试')
    }
  }

  async uploadMultipartKey() {
    const { ctx, app, service } = this

    const { identifier, filename } = ctx.query
    // console.log(ctx.query)
    const redisRecord = await app.redis.get(identifier)
    if(redisRecord) {
      ctx.helper.success({ctx})
    }
    const extname = filename.split('.')[filename.split('.').length - 1].toLowerCase() // 文件扩展名称
    let fileName = Date.now() + '.' + extname
    let key = 'dangke' + getKey() + fileName
    let result = await service.upload.get_multipart_upload_key(key)
    if (result.statusCode == 200) {
      const redisData = {
        Key: result.Key,
        UploadId: result.UploadId
      }
      await app.redis.set(identifier, JSON.stringify(redisData))
      ctx.helper.success({ctx})
    } else {
      ctx.throw(404, '文件上传失败，请重试')
    }
  }

  // 分块上传
  async uploadMultipart() {
    const { ctx, app, service } = this
    const stream = await ctx.getFileStream()
    // 所有表单字段都能通过 `stream.fields` 获取到
    // console.log(stream.fields)
    
    let result = await service.upload.multipart_stream_uploader(stream)
    // console.log(result)
    if(result.statusCode == 200) {
      const partsKey = stream.fields.identifier+ '_Parts'
      let partsString = await app.redis.get(partsKey)
      let parts = []
      if(partsString) {
        parts = JSON.parse(partsString)
      }
      // console.log(parseInt(stream.fields.chunkNumber) - 1)
      // console.log(parts)
      parts[parseInt(stream.fields.chunkNumber) - 1] = {PartNumber: stream.fields.chunkNumber, ETag: result.ETag}
      // console.log(parts)
      await app.redis.set(partsKey, JSON.stringify(parts))
      ctx.helper.success({ctx, res: result})
    } else {
      ctx.throw(301, '分块上传失败，请重试')
    }
  }

  // 实现完成整个分块上传
  async uploadComplete() {
    const { ctx, app, service } = this

    const { identifier } = ctx.query

    const partsKey = identifier+ '_Parts'
    const parts = JSON.parse(await app.redis.get(partsKey))
    const redisRecord = JSON.parse(await app.redis.get(identifier))
    let result = await service.upload.complete_multipart_uploader(
      redisRecord.Key, redisRecord.UploadId, parts)
    if (result.statusCode == 200) {
      await app.redis.del(identifier)
      await app.redis.del(partsKey)
      ctx.helper.success({ctx, result})
    } else {
      ctx.throw(404, '文件上传失败，请重试')
    }
  } 
}

module.exports = UploadController


function getKey() {
  let now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() + 1
  let day = now.getDate()

  return '/' + year + '/' + month + '/' + day + '/'
}

function sortId(a,b){  
  return parseInt(a.id) - parseInt(b.id) 
}