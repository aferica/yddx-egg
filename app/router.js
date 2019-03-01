'use strict'
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app
  router.get('/', controller.home.index)

  router.get('/api/wx/check/:code', controller.weapp.check)

  router.post('/api/user/register', controller.user.create)
  router.post('/api/user/login', controller.user.login)

  router.get('/api/user/get/report/:id', controller.user.getReport)

  router.get('/api/news/get', controller.news.index)
  router.get('/api/news/detail', controller.news.show)
  router.get('/api/news/suggest', controller.news.getSuggest)


  router.get('/api/videos/get', controller.videos.index)

  // role
  // router.post('/api/role', controller.role.create)
  // router.delete('/api/role/:id', controller.role.destroy)
  // router.put('/api/role/:id', controller.role.update)
  // router.get('/api/role/:id', controller.role.show)
  // // router.get('/api/role', controller.role.index)
  // router.delete('/api/role', controller.role.removes)
  // router.resources('role', '/api/role', controller.role)

  // // userAccess
  // router.post('/api/user/access/login', controller.userAccess.login)
  // router.get('/api/user/access/current', app.jwt, controller.userAccess.current)
  // router.get('/api/user/access/logout', controller.userAccess.logout)
  // router.put('/api/user/access/resetPsw', app.jwt, controller.userAccess.resetPsw)

  // user
  // router.post('/api/user', controller.user.create)
  // router.delete('/api/user/:id', controller.user.destroy)
  // router.put('/api/user/:id', controller.user.update)
  // router.get('/api/user/:id', controller.user.show)
  // // router.get('/api/user', controller.user.index)
  // router.delete('/api/user', controller.user.removes)
  // router.resources('user', '/api/user', controller.user)

  // upload
  router.post('/api/cos/upload/userPhoto', controller.upload.uploadUserPhoto)
  router.post('/api/cos/upload/dangke', controller.upload.uploadDangke)
  router.post('/api/cos/upload/multipart', controller.upload.uploadMultipart)
  router.get('/api/cos/upload/multipart/key', controller.upload.uploadMultipartKey)
  router.get('/api/cos/upload/complete', controller.upload.uploadComplete)
}
