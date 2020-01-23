const frisby = require('frisby');
//const Joi = frisby.Joi; // for jsonTypes tests

require('../lib/readEnv').readEnv();

const groveAppHost = process.env.GROVE_APP_HOST || 'localhost';
const groveAppPort = process.env.GROVE_APP_PORT || '9003';
const groveBaseUrl = 'http://' + groveAppHost + ':' + groveAppPort + '/';

const adminUser = process.env.GROVE_ADMIN_NAME || 'admin';
const adminPass = process.env.GROVE_ADMIN_PWD || 'admin';

console.log('Testing search-api.json against ' + groveBaseUrl);

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

describe('/api/search/all/results', () => {
  it('requires authentication', function() {
    return frisby
      .fetch(groveBaseUrl + 'api/search/all/results', {
        method: 'GET'
      })
      .expect('status', 401);
  });

  it('only allows POST', function() {
    return frisby
      .fetch(groveBaseUrl + 'api/search/all/results', {
        method: 'GET',
        headers: {
          cookie: cookie
        }
      })
      .expect('status', 405);
  });

  it('should allow POST', function() {
    return frisby
      .fetch(groveBaseUrl + 'api/search/all/results', {
        method: 'POST',
        headers: {
          cookie: cookie
        },
        body: JSON.stringify({
          filters: {},
          options: {}
        })
      })
      .expect('status', 200);
  });
});
