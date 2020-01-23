const frisby = require('frisby');
const Joi = frisby.Joi;

require('../lib/readEnv').readEnv();

const groveAppHost = process.env.GROVE_APP_HOST || 'localhost';
const groveAppPort = process.env.GROVE_APP_PORT || '9003';
const groveBaseUrl = 'http://' + groveAppHost + ':' + groveAppPort + '/';

const adminUser = process.env.GROVE_ADMIN_NAME || 'admin';
const adminPass = process.env.GROVE_ADMIN_PWD || 'admin';

console.log('Testing ping-api.json against ' + groveBaseUrl);

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

describe('/api/ping', () => {
  it('should not listen to something unknown under /api', function() {
    return frisby.get(groveBaseUrl + 'api/non-existing').expect('status', 404);
  });

  it('should listen to GET /api/ping', function() {
    return frisby
      .get(groveBaseUrl + 'api/ping')
      .expect('status', 200)
      .expect('json', 'ping', 'pong')
      .expect('jsonTypes', '', {
        name: Joi.string().optional(),
        version: Joi.string().optional()
      });
  });

  it('should include backend details when authenticated', function() {
    return frisby
      .fetch(groveBaseUrl + 'api/ping', {
        method: 'GET',
        headers: {
          cookie: cookie
        }
      })
      .expect('status', 200)
      .expect('json', 'ping', 'pong')
      .expect('jsonTypes', '', {
        name: Joi.string().optional(),
        version: Joi.string().optional(),
        backend: Joi.object().required()
      });
  });

  it('should not listen to non-GET /api/ping', function() {
    return frisby.post(groveBaseUrl + 'api/ping').expect('status', 405);
  });

  it('should not listen to anything else below /api/ping', function() {
    return frisby.get(groveBaseUrl + 'api/ping/pong').expect('status', 404);
  });

  it('should receive anything', function() {
    return frisby
      .fetch(groveBaseUrl + 'api/ping', {
        method: 'GET',
        headers: {
          'content-type': 'application/octet-stream'
        }
      })
      .expect('status', 200)
      .expect('json', 'ping', 'pong');
  });

  it('should always send json', function() {
    return frisby
      .fetch(groveBaseUrl + 'api/ping', {
        method: 'GET',
        headers: {
          accept: 'application/xml'
        }
      })
      .expect('status', 200)
      .expect('json', 'ping', 'pong');
  });
});
