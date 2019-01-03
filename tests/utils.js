const childProcess = require('child_process');
const util = require('util');

const stopDocker = config => {
  const containerName = config.name || 'grove-core-api-specs';
  return util
    .promisify(childProcess.exec)(
      `docker stop ${containerName} && docker rm -v ${containerName}`
    )
    .catch(() => {
      // probably the Docker container does not exist
      // there may be a better way to check this
      return Promise.resolve();
    });
};

const startDocker = config => {
  const containerName = config.name || 'grove-core-api-specs';
  return stopDocker({ name: containerName })
    .then(() =>
      util.promisify(childProcess.exec)(
        `docker run --privileged -d -p 8063:8063 --name=${containerName} grove-marklogic:1.0.0-rc.1-mlDeployed-9.0-8`
      )
    )
    .then(() => new Promise(resolve => setTimeout(resolve, 3000)));
};

module.exports = {
  startDocker,
  stopDocker
};
