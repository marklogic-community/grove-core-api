const frisby = require('frisby');
const Joi = frisby.Joi;

require('../lib/readEnv').readEnv();

const groveAppHost = process.env.GROVE_APP_HOST || 'localhost';
const groveAppPort = process.env.GROVE_APP_PORT || '9003';
const groveBaseUrl = 'http://' + groveAppHost + ':' + groveAppPort + '/';

console.log('Testing ping-api.json against ' + groveBaseUrl);

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
