import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { coerce } from "semver";

import { Repository } from "./types";

import getReleaseByTag from "./getReleaseByTag";
import downloadAsset from "./downloadAsset";
import installAsset from "./installAsset";

const REPOSITORIES: Repository[] = [
  { owner: "processing", repo: "processing4" },
  { owner: "processing", repo: "processing" },
];

async function run() {
  const tag = core.getInput("tag") || undefined;
  const assetName = core.getInput("asset-name") || undefined;
  core.info(`setup-processing: tag=${tag}, assetName=${assetName}`);

  core.debug(
    `Attempting to find release with the following tag: ${
      tag ?? "(Infered, none given)"
    }...`
  );
  const release = await getReleaseByTag(REPOSITORIES, tag);
  core.debug(`Found release: ${JSON.stringify(release)}`);

  core.debug(`Trying to locate existing Processing installation...`);
  let semverTag = getRevisionNumber(release.tag);
  core.info(`Semver tag: ${semverTag}`);

  let cachedDirectory = tc.find("processing", semverTag);
  if (cachedDirectory) {
    core.info(`Processing (${release.tag}) is already cached. Aborting...`);
    core.addPath(cachedDirectory);
    return;
  }
  core.debug("No existing Processing installation found.");

  core.debug(
    `Attempting to download release asset with the following assetName: ${
      assetName ?? "(Infered, none given)"
    }...`
  );
  const downloadPath = await downloadAsset(release.assets, assetName);
  core.debug(`Downloaded release asset at ${downloadPath}`);

  core.debug(`Attempting to install...`);
  const installPath = await installAsset(downloadPath, semverTag);
  core.setOutput("install-dir", installPath);

  core.info(`Processing successfully installed!`);

  function getRevisionNumber(tag: string): string {
    const matches = tag.match(/.*-0*([0-9]+)-.*/);
    if (matches === null) {
      throw new Error(`Could not parse tag for revision number: tag=${tag}`);
    }

    const semver = coerce(matches[1]);

    if (semver === null) {
      throw new Error(
        `Could not coerce revision number to semver: number=${matches[1]}. Please file an issue`
      );
    }

    if (semver.compare("1300.0.0") >= 0) {
      // If given version is older than rev 1300

      throw new Error(
        `Unfortunately, this plugin does not support Processing revisions 1300 or newer. Please install the official snap distributions of Processing instead.`
      );
    }

    const out = semver.format();

    return out;
  }
}

run().catch((reason) => core.setFailed(reason.message));
