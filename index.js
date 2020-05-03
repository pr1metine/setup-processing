const core = require('@actions/core')
const tc = require('@actions/tool-cache')

async function run() {

    const version = core.getInput('version')
    const filetype = core.getInput('platform-filetype')
    const zip = filetype.match(/ *.zip$ /)
    const macosx = filetype.match(/ *macos* /)
    console.log(`Processing ${version}, ${filetype}, compression: ${zip || '.tgz'}, macosx: ${macosx}`)

    console.log(`Trying to find Path: ${tc.find('processing', version)}`)
    if (tc.find('processing', version)) {
        console.log('Processing is already cached. Aborting... ')
        return;
    }

    console.log(`Downloading Processing ${version}...`)
    const procPath = await tc.downloadTool(`https://download.processing.org/processing-${version}-${filetype}`)
    console.log(`Downloaded: ${procPath}`)

    console.log('Extracting...')
    const procExtractedFolder = zip ?
        await tc.extractZip(procPath, 'processing') :
        await tc.extractTar(procPath, 'processing');
    console.log(`Extracted: ${procExtractedFolder}`)

    console.log('Caching...')
    const cachedPath = macosx ?
        await tc.cacheDir(`${procExtractedFolder}/Processing.app`, 'processing', version) :
        await tc.cacheDir(`${procExtractedFolder}/processing-${version}`, 'processing', version);
    core.addPath(cachedPath)
    console.log(`Cached and added to path ${cachedPath}`)
}

try {
    run();
} catch (error) {
    core.setFailed(error.message)
}