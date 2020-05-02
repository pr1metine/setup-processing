// const core = require('@actions/core') 
// const tc = require('@actions/tool-cache') 

// try {
//     const procPath = await tc.downloadTool('https://download.processing.org/processing-3.5.4-linux64.tgz') 
//     const procExtractedFolder = await tc.extractTar(procPath, '/usr/bin/processing') 
    
//     const cachedPath = await tc.cacheDir(procExtractedFolder, 'processing', '3.5.4') 
//     core.addPath(cachedPath) 
// } catch (error) {
//     core.setFailed(error.message) 
// }

const tc = require('@actions/tool-cache');
const core = require('@actions/core');

const node12Path =  tc.downloadTool('https://nodejs.org/dist/v12.7.0/node-v12.7.0-linux-x64.tar.gz');
const node12ExtractedFolder =  tc.extractTar(node12Path, 'path/to/extract/to');

const cachedPath =  tc.cacheDir(node12ExtractedFolder, 'node', '12.7.0');
core.addPath(cachedPath);