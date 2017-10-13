const jwt = require('jsonwebtoken')
const cache = require('memory-cache')

function auth(conn) {
  const token = conn.headers && conn.headers['x-access-token'] || null

  function authentication() {
    return {code: 401, message: '需要身份认证'}
  }

  if(token) {
    let decoded;
    const now = Math.floor(Date.now() / 1000)

    try{
      decoded = jwt.verify(token, 'access_token');
    }catch(err) {
      return authentication()
    }

    if(!decoded || (decoded.iat > now || decoded.exp < now)) {
      return authentication()
    }

    const accessToken = cache.get('access_token_' + decoded.uid);

    if(!accessToken) {
      return authentication()
    }

    return {code: 200, message: 'access_token验证成功'}
  }

  return authentication()
}

module.exports = auth
