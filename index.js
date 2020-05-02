const core = require('@actions/core')
const tc = require('@actions/tool-cache')

async function run() {

    const version = core.getInput('version')
    const filetype = core.getInput('platform-filetype')
    const tar = filetype.match(/ *.tgz$/)

    console.log(`Potential Path: ${tc.find('processing', '3.5.4', 'x64')}`)
    if (tc.find('processing', '3.5.4', 'x64')) {
        console.log('Processing is already cached.')
        return;
    }

    try {
        console.log('Downloading Processing 3.5.4...')
        const procPath = await tc.downloadTool(`https://download.processing.org/processing-${version}-${filetype}`)
        console.log(`Downloaded: ${procPath}`)

        console.log('Extracting...')
        const procExtractedFolder = tar ? 
                                    await tc.extractTar(procPath, 'processing') : 
                                    await tc.extractZip(procPath, 'processing');
        
        console.log(`Extracted: ${procExtractedFolder}`)

        console.log('Caching...')
        const cachedPath = await tc.cacheDir(`${procExtractedFolder}/processing-${version}`, 'processing', version)
        core.addPath(cachedPath)
        console.log(`Cached and added to path ${cachedPath}`)
    } catch (error) {
        core.setFailed(error.message)
    }
}

run();