const fs = require('fs')
const path = require('path')
const awaitWriteStream = require('await-stream-ready').write
const sendToWormhole = require('stream-wormhole')
const Service = require('egg').Service

class UploadService extends Service {

  // 获取分块上传参数
  async get_multipart_upload_key(key) {
    const { ctx, app } = this
    return new Promise((resolve, reject) => {
      // 腾讯云 文件上传
      let params = {
        Bucket: app.config.cos.client.bucket,                         /* 必须 */
        Region: app.config.cos.client.region,                         /* 必须 */
        Key: key,                                           /* 必须 */
      }
      // console.log(params)
      app.cos.multipartInit(params, function(err, data) {
        if(err) {
          return reject(err)
        } else {
          return resolve(data)
        }
      })
    })
  }

  // 分块上传
  async multipart_stream_uploader(stream) {
    const { ctx, app } = this

    let redisRecord = await app.redis.get(stream.fields.identifier)
    if(redisRecord) {
      redisRecord = JSON.parse(redisRecord)
      return new Promise((resolve, reject) => {
        // 腾讯云 文件上传
        let params = {
          Bucket: app.config.cos.client.bucket,                         /* 必须 */
          Region: app.config.cos.client.region,                         /* 必须 */
          Key: redisRecord.Key,                                           /* 必须 */
          UploadId: redisRecord.UploadId,
          Body: stream,
          ContentLength: stream.fields.currentChunkSize,
          PartNumber: stream.fields.chunkNumber
        }
        // console.log(params)
        app.cos.multipartUpload(params, function(err, data) {
          sendToWormhole(stream)
          if(err) {
            return reject(err)
          } else {
            return resolve(data)
          }
        })
      })
    } else {
      return null
    }
  }

  async complete_multipart_uploader(key, uploadId, parts) {
    const { ctx, app } = this
    return new Promise((resolve, reject) => {
      // 腾讯云 文件上传
      let params = {
        Bucket: app.config.cos.client.bucket,                         /* 必须 */
        Region: app.config.cos.client.region,                         /* 必须 */
        Key: key,                                           /* 必须 */
        UploadId: uploadId,
        Parts: parts
      }
      // console.log(params)
      app.cos.multipartComplete(params, function(err, data) {
        if(err) {
          return reject(err)
        } else {
          return resolve(data)
        }
      })
    })
  }

  // 上传文件到腾讯云对象存储
  async stream_uploader(stream, key) {
    const { ctx, app } = this
    return new Promise((resolve, reject) => {
      // 腾讯云 文件上传
      let params = {
        Bucket: app.config.cos.client.bucket,                         /* 必须 */
        Region: app.config.cos.client.region,                         /* 必须 */
        Key: key,                                           /* 必须 */
        Body: stream,                                       /* 必须 */
        ContentLength: stream._readableState.length
      }
      // console.log(params)
      app.cos.putObject(params, function(err, data) {
        sendToWormhole(stream)
        if(err) {
          return reject(err)
        } else {
          return resolve(data)
        }
      })
    })
  }
}

module.exports = UploadService