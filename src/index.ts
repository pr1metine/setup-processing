import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as github from "@actions/github";

async function run() {
  const version = core.getInput("version");
  const filetype = core.getInput("platform-filetype");
  const zip = filetype.match(/ *.zip$/);
  const macosx = filetype.match(/ *macosx */);
  core.debug(
    `Processing ${version}, ${filetype}, compression: ${
      zip || ".tgz"
    }, macosx: ${macosx}`
  );

  core.debug(`Trying to locate existing Processing installation`);
  if (tc.find("processing", version)) {
    core.info("Processing is already cached. Aborting... ");
    return;
  }

  core.info(
    `Downloading Processing ${version} (https://download.processing.org/processing-${version}-${filetype})...`
  );
  const procPath = await tc.downloadTool(
    `https://download.processing.org/processing-${version}-${filetype}`
  );
  core.debug(`Downloaded: ${procPath}`);

  core.debug("Extracting...");
  const procExtractedFolder = zip
    ? await tc.extractZip(procPath, "processing")
    : await tc.extractTar(procPath, "processing");
  core.debug(`Extracted: ${procExtractedFolder}`);

  core.debug("Caching...");
  const cachedPath = macosx
    ? await tc.cacheDir(
        `${procExtractedFolder}/Processing.app`,
        "processing",
        version
      )
    : await tc.cacheDir(
        `${procExtractedFolder}/processing-${version}`,
        "processing",
        version
      );
  core.addPath(cachedPath);
  core.info(`Cached and added to path ${cachedPath}`);
}

try {
  run();
} catch (error: any) {
  core.setFailed(error.message);
}
