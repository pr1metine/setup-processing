const core = require('@actions/core');
const github = require('@actions/github');
const tc = require('@actions/tool-cache');

try {
    const procPath = await tc.downloadTool('https://download.processing.org/processing-3.5.4-linux64.tgz');

    const procExtractedFolder = await tc.extractTar(procPath, '/usr/bin/processing');
    
    const cachedPath = await tc.cacheDir(procExtractedFolder, 'processing', '3.5.4');

    core.addPath(cachedPath);

    console.log('procPath');
} catch (error) {
    core.setFailed(error.message);
}