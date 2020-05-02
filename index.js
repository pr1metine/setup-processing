const core = require('@actions/core')
const tc = require('@actions/tool-cache')

async function run() {
    if (tc.find('processing', '3.5.4', 'x64')) {
        console.log('Processing is already cached.')
        return;
    }

    try {
        console.log('Downloading Processing 3.5.4...')
        const procPath = await tc.downloadTool('https://download.processing.org/processing-3.5.4-linux64.tgz')
        console.log(`Downloaded: ${procPath}`)

        console.log('Extracting...')
        const procExtractedFolder = await tc.extractTar(procPath, 'processing')
        console.log(`Extracted: ${procExtractedFolder}`)

        console.log('Caching...')
        const cachedPath = await tc.cacheDir(`${procExtractedFolder}/processing-3.5.4`, 'processing', '3.5.4')
        core.addPath(cachedPath)
        console.log(`Cached and added to path ${cachedPath}`)
    } catch (error) {
        core.setFailed(error.message)
    }
}

run();