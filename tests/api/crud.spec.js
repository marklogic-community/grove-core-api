const frisby = require('frisby');
//const Joi = frisby.Joi; // for jsonTypes tests

require('../lib/readEnv').readEnv();

const groveAppHost = process.env.GROVE_APP_HOST || 'localhost';
const groveAppPort = process.env.GROVE_APP_PORT || '9003';
const groveBaseUrl = 'http://' + groveAppHost + ':' + groveAppPort + '/';

// const groveUser = (process.env.GROVE_APP_NAME || 'grove-app') + '-user';
// const grovePass = process.env.GROVE_DEFAULT_PWD || '';

console.log('Testing crud-api.json against ' + groveBaseUrl);

describe('/api/crud/all/123', () => {
  it('requires authentication', function() {
    return frisby
      .fetch(groveBaseUrl + 'api/crud/all/123', {
        method: 'GET'
      })
      .expect('status', 401);
  });

  describe('with authentication', () => {
    const login = () => {
      return frisby
        .post(groveBaseUrl + 'api/auth/login', {
          username: 'admin',
          password: 'admin'
        })
        .expect('status', 200)
        .expect('json', 'authenticated', true)
        .expect('json', 'username', 'admin')
        .then(function(res) {
          cookie = res.headers.get('set-cookie');
        });
    };

    let cookie;
    beforeAll(login);

    it('only allows GET,POST,PUT,DELETE', function() {
      return frisby
        .fetch(groveBaseUrl + 'api/crud/all/123', {
          method: 'HEAD',
          headers: {
            cookie: cookie
          }
        })
        .expect('status', 405);
    });

    it('should allow GET', function() {
      return frisby
        .fetch(groveBaseUrl + 'api/crud/all/123', {
          method: 'GET',
          headers: {
            cookie: cookie
          }
        })
        .expect('status', 404);
    });

    it('should allow PUT to Create', function() {
      return frisby
        .fetch(groveBaseUrl + 'api/crud/all/123', {
          method: 'PUT',
          headers: {
            cookie: cookie
          },
          body: JSON.stringify({
            test: 'grove-core-api'
          })
        })
        .expect('status', 201)
        .then(function() {
          return frisby
            .fetch(groveBaseUrl + 'api/crud/all/123', {
              method: 'GET',
              headers: {
                cookie: cookie
              }
            })
            .expect('status', 200)
            .expect('json', 'test', 'grove-core-api');
        });
    });

    it('cannot Create twice', function() {
      return frisby
        .fetch(groveBaseUrl + 'api/crud/all/123', {
          method: 'PUT',
          headers: {
            cookie: cookie
          },
          body: JSON.stringify({
            test: 'grove-core-api'
          })
        })
        .expect('status', 409);
    });

    it('should allow POST for Update', function() {
      return frisby
        .fetch(groveBaseUrl + 'api/crud/all/123', {
          method: 'POST',
          headers: {
            cookie: cookie
          },
          body: JSON.stringify({
            test: 'updated grove-core-api'
          })
        })
        .expect('status', 204)
        .then(function() {
          return frisby
            .fetch(groveBaseUrl + 'api/crud/all/123', {
              method: 'GET',
              headers: {
                cookie: cookie
              }
            })
            .expect('status', 200)
            .expect('json', 'test', 'updated grove-core-api');
        });
    });

    it('cannot Update non-existing', function() {
      return frisby
        .fetch(groveBaseUrl + 'api/crud/all/non-existing', {
          method: 'POST',
          headers: {
            cookie: cookie
          },
          body: JSON.stringify({
            test: 'updated grove-core-api'
          })
        })
        .expect('status', 404);
    });

    it('should allow DELETE', function() {
      return frisby
        .fetch(groveBaseUrl + 'api/crud/all/123', {
          method: 'DELETE',
          headers: {
            cookie: cookie
          }
        })
        .expect('status', 204)
        .then(function() {
          return frisby
            .fetch(groveBaseUrl + 'api/crud/all/123', {
              method: 'GET',
              headers: {
                cookie: cookie
              }
            })
            .expect('status', 404);
        });
    });

    it('cannot DELETE twice', function() {
      return frisby
        .fetch(groveBaseUrl + 'api/crud/all/123', {
          method: 'DELETE',
          headers: {
            cookie: cookie
          }
        })
        .expect('status', 404);
    });
  });
});
