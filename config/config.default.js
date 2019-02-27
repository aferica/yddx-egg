module.exports = appInfo => {
  const config = exports = {}

  exports.cluster = {
    listen: {
      port: 4040,
      hostname: '0.0.0.0',
    },
  }

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1542251706357_7348'

  // add your config here
  // 加载 errorHandler 中间件
  config.middleware = [ 'errorHandler' ]

  // 只对 /api 前缀的 url 路径生效
  // config.errorHandler = {
  //   match: '/api',
  // }

  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: [ 'http://localhost:8000' ],
  }

  config.multipart = {
    fileExtensions: [ '.apk', '.pptx', '.docx', '.csv', '.doc', '.ppt', '.pdf', '.pages', '.wav', '.mov' ], // 增加对 .apk 扩展名的支持
  },

  config.bcrypt = {
    saltRounds: 10 // default 10
  }

  config.jwt = {
    secret: 'Great4-M',
    enable: true, // default is false
    match: '/jwt', // optional
  }

  exports.mysql = {
    // database configuration
    client: {
      // host
      host: '127.0.0.1',
      // host: '193.112.176.174',
      // port
      port: '3306',
      // username
      user: 'root',
      // password
      password: '123456',
      // password: 'HCKJ@admin',
      // database
      database: 'yddx',
    },
    // load into app, default is open
    app: true,
    // load into agent, default is close
    agent: false,
  }

  config.redis = {
    client: {
      host: '127.0.0.1',
      port: '6379',
      password: '',
      db: '0',
    },
  }

  // replace your appId and appSecret of WEAPP
  config.weapp = {
    appId: 'wx540cd05861c228f1',
    appSecret: 'ded42858e25de95465adbb8e0485bf81',
  }

  exports.cos = {
    client: {
      secretId: 'AKIDvpZ7Uh59UvSvEMM6f7OTN4Zw88wXak6F',
      secretKey: '63nbRXilfNyNoEYnxvgIm4AnJdlhS1Qg',
      bucket: 'yidongdangxiao-1256926653',
      region: 'ap-guangzhou',
    },
  }

  return config
}
