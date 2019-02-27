module.exports = appInfo => {
  const config = exports = {}

  config.middleware = [ 'errorHandler' ]

  exports.mysql = {
    // database configuration
    client: {
      // host
      host: '127.0.0.1',
      // port
      port: '3306',
      // username
      user: 'root',
      // password
      password: 'HCKJ@admin',
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
      password: 'HCKJ@admin',
      db: '0',
    },
  }

  return config
}