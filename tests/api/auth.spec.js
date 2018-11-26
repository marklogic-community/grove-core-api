const frisby = require('frisby');
const Joi = frisby.Joi;

require('../lib/readEnv').readEnv();

const groveAppHost = process.env.GROVE_APP_HOST || 'localhost';
const groveAppPort = process.env.GROVE_APP_PORT || '9003';
const groveBaseUrl = 'http://' + groveAppHost + ':' + groveAppPort + '/';

console.log('Testing auth-api.json against ' + groveBaseUrl);

describe('/api/auth/status', () => {
  it('only allows GET', function () {
    return frisby
      .post(groveBaseUrl + 'api/auth/status')
      .expect('status', 405);
  });

  it('can receive anything', function () {
    return frisby
      .fetch(groveBaseUrl + 'api/auth/status', {
        method: 'GET',
        headers: {
          'content-type': 'application/octet-stream'
        }
      })
      .expect('status', 200);
  });

  it('can only return json', function () {
    return frisby
      .fetch(groveBaseUrl + 'api/auth/status', {
        method: 'GET',
        headers: {
          accept: 'application/xml'
        }
      })
      .expect('status', 406);
  });

  it('should always return a status', function () {
    return frisby
      .get(groveBaseUrl + 'api/auth/status')
      .expect('status', 200)
      .expect('jsonTypes', '', {
        'authenticated': Joi.boolean().required(),
        'username': Joi.string().optional(),
        'profile': Joi.object().required(),
        'appName': Joi.string().optional(),
        'disallowUpdates': Joi.boolean().optional(),
        'appUsersOnly': Joi.boolean().optional()
      });
  });

  it('should return auth false for default user', function () {
    return frisby
      .get(groveBaseUrl + 'api/auth/status')
      .expect('json', 'authenticated', false);
  });

  it('should return username for authed user', function () {
    return frisby
      .fetch(groveBaseUrl + 'api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'admin',
          password: 'admin'
        })
      })
      .expect('status', 200)
      .expect('json', 'authenticated', true)
      .expect('json', 'username', 'admin')
      .then(function(res) {
        return frisby
          .fetch(groveBaseUrl + 'api/auth/status', {
            method: 'GET',
            headers: {
              cookie: res.headers.get('set-cookie')
            }
          })
          .expect('status', 200)
          .expect('jsonTypes', 'username', Joi.string().required());
      });
  });

  it('should return authed false after logout', function () {
    return frisby
      .fetch(groveBaseUrl + 'api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'admin',
          password: 'admin'
        })
      })
      .expect('status', 200)
      .expect('json', 'authenticated', true)
      .expect('json', 'username', 'admin')
      .then(function(res) {
        let cookie = res.headers.get('set-cookie');
        return frisby
          .fetch(groveBaseUrl + 'api/auth/logout', {
            method: 'POST',
            headers: {
              cookie: cookie
            }
          })
          .expect('status', 204)
          .then(function(res2) {
            return frisby
            .fetch(groveBaseUrl + 'api/auth/status', {
              method: 'GET',
              headers: {
                cookie: cookie
              }
            })
            .expect('status', 200)
            .expect('json', 'authenticated', false);
          });
      });
  });
});

describe('/api/auth/login', () => {
  it('only allows POST', function () {
    return frisby
      .get(groveBaseUrl + 'api/auth/login')
      .expect('status', 405);
  });

  it('can receive only json', function () {
    return frisby
      .fetch(groveBaseUrl + 'api/auth/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/xml'
        }
      })
      .expect('status', 415);
  });

  it('can only return json', function () {
    return frisby
      .fetch(groveBaseUrl + 'api/auth/login', {
        method: 'POST',
        headers: {
          accept: 'application/xml'
        }
      })
      .expect('status', 406);
  });

  it('should expect username and password', function () {
    return frisby
      .post(groveBaseUrl + 'api/auth/login')
      .expect('status', 400);
  });

  it('should fail for bad user', function () {
    return frisby
      .post(groveBaseUrl + 'api/auth/login', {
        username: 'bad',
        password: 'user'
      })
      .expect('status', 401);
  });

  it('should succeed for good user', function () {
    return frisby
      .post(groveBaseUrl + 'api/auth/login', {
        username: 'admin',
        password: 'admin'
      })
      .expect('status', 200)
      .expect('json', 'authenticated', true)
      .expect('json', 'username', 'admin');
  });
});

describe('/api/auth/logout', () => {
  it('only allows POST', function () {
    return frisby
      .get(groveBaseUrl + 'api/auth/logout')
      .expect('status', 405);
  });

  it('can receive anything', function () {
    return frisby
      .fetch(groveBaseUrl + 'api/auth/logout', {
        method: 'POST',
        headers: {
          'content-type': 'application/xml'
        }
      })
      .expect('status', 204);
  });

  it('always returns empty', function () {
    return frisby
      .fetch(groveBaseUrl + 'api/auth/logout', {
        method: 'POST',
        headers: {
          accept: 'application/xml'
        }
      })
      .expect('status', 204)
      .expect('bodyContains', /^$/);
  });

  it('should expect username and password', function () {
    return frisby
      .post(groveBaseUrl + 'api/auth/login')
      .expect('status', 400);
  });

  it('should fail for bad user', function () {
    return frisby
      .post(groveBaseUrl + 'api/auth/login', {
        username: 'bad',
        password: 'user'
      })
      .expect('status', 401);
  });

  it('should succeed for good user', function () {
    return frisby
      .post(groveBaseUrl + 'api/auth/login', {
        username: 'admin',
        password: 'admin'
      })
      .expect('status', 200)
      .expect('json', 'authenticated', true)
      .expect('json', 'username', 'admin');
  });
});
