import * as fs from "fs";
import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";

/**
 * Installs an extract asset and adds it to the GitHub Runner's
 * path.
 *
 * @param extractedDir Directory of asset to be installed
 * @param tag Revision number of Processing as SemVer
 * @returns Path of Processing install directory
 */
async function installAsset(
  extractedDir: string,
  tag: string
): Promise<string> {
  let childEntries = await fs.promises.opendir(extractedDir);
  let next = childEntries.readSync();

  if (next === null || next.isFile() || next.name === undefined) {
    throw new Error(
      `Unexpected folder structure of extraced Processing archive. Please open an issue`
    );
  }
  let subFolder = core.toPlatformPath(`${extractedDir}/${next.name}`);
  childEntries.close();
  let cachedPath = await tc.cacheDir(subFolder, "processing", tag);
  core.addPath(cachedPath);

  return cachedPath;
}

export default installAsset;
