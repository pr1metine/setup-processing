const core = require('@actions/core');
const github = require('@actions/github');
const tc = require('@actions/tool-cache');

try {
    const procPath = await tc.downloadTool('https://download.processing.org/processing-3.5.4-linux64.tgz');
    console.log(`procPath: ${procPath}`);

    const procExtractedFolder = await tc.extractTar(procPath, '/usr/bin/processing');
    console.log(`procExtractedFolder: ${procExtractedFolder}`);
    
    const cachedPath = await tc.cacheDir(procExtractedFolder, 'processing', '3.5.4');
    console.log(`cachedPath: ${cachedPath}`);
    core.addPath(cachedPath);
} catch (error) {
    core.setFailed(error.message);
}