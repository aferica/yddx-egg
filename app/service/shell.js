const child_process = require('child_process')
const Service = require('egg').Service

class ShellService extends Service {

  async getShellResult(shell) {
    return new Promise((resolve, reject) => {
      child_process.exec(shell,function(error,stdout,stderr){
        if(error) {
          return reject(error)
        }
        if(stdout.length >1){
          return resolve(stdout)
        } else {
          return reject(stderr)
        }
      })
    })
  }
}

module.exports = ShellService