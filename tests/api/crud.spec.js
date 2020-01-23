const frisby = require('frisby');
//const Joi = frisby.Joi; // for jsonTypes tests

require('../lib/readEnv').readEnv();

const groveAppHost = process.env.GROVE_APP_HOST || 'localhost';
const groveAppPort = process.env.GROVE_APP_PORT || '9003';
const groveBaseUrl = 'http://' + groveAppHost + ':' + groveAppPort + '/';

const adminUser = process.env.GROVE_ADMIN_NAME || 'admin';
const adminPass = process.env.GROVE_ADMIN_PWD || 'admin';

console.log('Testing crud-api.json against ' + groveBaseUrl);

// Prepare tests

var cookie;

beforeAll(() => {
  return frisby
    .post(groveBaseUrl + 'api/auth/login', {
      username: adminUser,
      password: adminPass
    })
    .expect('status', 200)
    .expect('json', 'authenticated', true)
    .expect('json', 'username', adminUser)
    .then(function(res) {
      cookie = res.headers.get('set-cookie');
    });
});

// Run tests

describe('/api/crud/all', () => {
  it('requires authentication', function() {
    return frisby
      .fetch(groveBaseUrl + 'api/crud/all', {
        method: 'GET'
      })
      .expect('status', 401);
  });

  it('only allows POST without id', function() {
    return frisby
      .fetch(groveBaseUrl + 'api/crud/all', {
        method: 'GET',
        headers: {
          cookie: cookie
        }
      })
      .expect('status', 405);
  });

  it('only allows POST without id', function() {
    return frisby
      .fetch(groveBaseUrl + 'api/crud/all', {
        method: 'PUT',
        headers: {
          cookie: cookie
        }
      })
      .expect('status', 405);
  });

  it('only allows POST without id', function() {
    return frisby
      .fetch(groveBaseUrl + 'api/crud/all', {
        method: 'DELETE',
        headers: {
          cookie: cookie
        }
      })
      .expect('status', 405);
  });

  it('should allow POST to Create without id', function() {
    return frisby
      .fetch(groveBaseUrl + 'api/crud/all', {
        method: 'POST',
        headers: {
          cookie: cookie
        },
        body: JSON.stringify({
          test: 'grove-core-api'
        })
      })
      .expect('status', 201)
      .then(function(res) {
        var id = res.headers.get('location');
        return (
          frisby
            .fetch(groveBaseUrl + 'api/crud/all/' + id, {
              method: 'GET',
              headers: {
                cookie: cookie
              }
            })
            .expect('status', 200)
            .expect('json', 'test', 'grove-core-api')

            // cleanup immediately
            .then(function() {
              return frisby.fetch(groveBaseUrl + 'api/crud/all/' + id, {
                method: 'DELETE',
                headers: {
                  cookie: cookie
                }
              });
            })
        );
      });
  });
});

describe('/api/crud/all/123', () => {
  it('requires authentication', function() {
    return frisby
      .fetch(groveBaseUrl + 'api/crud/all/123', {
        method: 'GET'
      })
      .expect('status', 401);
  });

  it('only allows GET,PUT,DELETE with id', function() {
    return frisby
      .fetch(groveBaseUrl + 'api/crud/all/123', {
        method: 'POST',
        headers: {
          cookie: cookie
        }
      })
      .expect('status', 405);
  });

  it('should allow GET with id', function() {
    return frisby
      .fetch(groveBaseUrl + 'api/crud/all/123', {
        method: 'GET',
        headers: {
          cookie: cookie
        }
      })
      .expect('status', 404);
  });

  it('should allow PUT to Create with id', function() {
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

  it('should allow PUT for Update', function() {
    return frisby
      .fetch(groveBaseUrl + 'api/crud/all/123', {
        method: 'PUT',
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
    // ML Rest-api is known to ignore rather than fail
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
