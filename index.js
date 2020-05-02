const core = require('@actions/core') 
const tc = require('@actions/tool-cache') 

async function run(){
    try {
        console.log('Downloading Processing 3.5.4...')
        const procPath = await tc.downloadTool('https://download.processing.org/processing-3.5.4-linux64.tgz') 
        console.log(`Downloaded: ${procPath}`)
    
        console.log('Extracting...')
        const procExtractedFolder = await tc.extractTar(procPath, 'processing') 
        console.log(`Extracted: ${procExtractedFolder}`)
    
        console.log('Caching...')
        const cachedPath = await tc.cacheDir(procExtractedFolder, 'processing', '3.5.4') 
        core.addPath(cachedPath) 
        console.log(`Cached and added to path ${cachedPath}`)
    } catch (error) {
        core.setFailed(error.message) 
    }
}

run();

// const tc = require('@actions/tool-cache');
// const core = require('@actions/core');

// const tc = require('@actions/tool-cache');
// const core = require('@actions/core');

// const node12Path = await tc.downloadTool('https://nodejs.org/dist/v12.7.0/node-v12.7.0-linux-x64.tar.gz');
// const node12ExtractedFolder = await tc.extractTar(node12Path, 'path/to/extract/to');

// const cachedPath = await tc.cacheDir(node12ExtractedFolder, 'node', '12.7.0');
// core.addPath(cachedPath);