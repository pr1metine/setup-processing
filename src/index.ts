import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import * as fs from "fs";
import { coerce } from "semver";

let OCTOKIT = new Octokit();

const REPOSITORIES: Repository[] = [
  { owner: "processing", repo: "processing4" },
  { owner: "processing", repo: "processing" },
];

type Repository = {
  owner: string;
  repo: string;
};

type ArchiveType = "application/zip" | "application/gzip";

type ReleaseAsset = {
  name: string;
  url: string;
  content_type: ArchiveType;
};

type Release = {
  tag: string;
  assets: ReleaseAsset[];
};

/**
 * Retrieves a release with the specified tag.
 *
 * If no tag is specified, the latest will be returned. This function will search for
 * the given tag inside the given repositories `repos`. If the given tag occurs in
 * multiple repositories, the release from the left most repo of `repos` will be
 * returned.
 *
 * @param repos Repositories to look for a Processing release
 * @param tag The tag of the desired release
 * @returns The desired release
 */
async function getReleaseByTag(
  repos: Repository[],
  tag?: string
): Promise<Release> {
  if (repos.length < 1) {
    throw new Error(
      `No Processing repos specified in which to look for the specified tag`
    );
  }

  const isFulfilled = <T>(
    input: PromiseSettledResult<T>
  ): input is PromiseFulfilledResult<T> => input.status === "fulfilled";

  let releases = await Promise.allSettled(
    repos.map((repo) =>
      tag !== undefined
        ? OCTOKIT.rest.repos.getReleaseByTag({
            ...repo,
            tag: tag,
          })
        : OCTOKIT.rest.repos.getLatestRelease(repo)
    )
  ).then((results) =>
    results.filter(isFulfilled).map((result) => result.value)
  );

  let successfullyRetrievedReleases = releases.filter(
    (release) => release.status >= 200 && release.status < 300
  );

  if (successfullyRetrievedReleases.length < 1) {
    throw new Error(
      `Could not find a Processing release for the following tag: ${JSON.stringify(
        tag
      )}`
    );
  }

  let release = successfullyRetrievedReleases[0].data;
  let out = {
    tag: release.tag_name,
    assets: release.assets.map((asset) => {
      return {
        name: asset.name,
        url: asset.browser_download_url,
        content_type: getArchiveType(asset.content_type),
      };
    }),
  };

  return out;

  function getArchiveType(content_type: string): ArchiveType {
    if (
      content_type !== "application/zip" &&
      content_type !== "application/gzip"
    ) {
      throw new Error(
        `Unsupported archive type: ${content_type}. Please file an issue`
      );
    }

    return <ArchiveType>content_type;
  }
}

async function installAsset(
  tag: string,
  assets: ReleaseAsset[],
  archiveName?: string
) {
  let asset = getAssetByName(assets, archiveName);
  if (asset === undefined) {
    throw new Error(
      `The given archive name does not exist: ${
        archiveName ?? "(Infered, please open an issue for this)"
      }`
    );
  }
  core.info(`Downloading release asset "${asset.name}"`);

  let path = await extractTool(
    await tc.downloadTool(asset.url),
    asset.content_type
  );

  await cacheProcessingBinary(path, tag);

  async function cacheProcessingBinary(extractedDir: string, tag: string) {
    let childEntries = await fs.promises.opendir(extractedDir);
    let next = childEntries.readSync();

    if (next === null || next.isFile() || next.name === undefined) {
      throw new Error(
        `Unexpected folder structure of extraced Processing archive. Please open an issue`
      );
    }
    let subFolder = core.toPlatformPath(`${extractedDir}/${next.name}`);
    let cachedPath = await tc.cacheDir(subFolder, "processing", tag);
    core.addPath(cachedPath);
  }
  function getAssetByName(
    assets: ReleaseAsset[],
    assetName?: string
  ): ReleaseAsset | undefined {
    if (assetName === undefined) {
      core.info(`Infering correct asset file name...`);
      let matchers = getMatchers(process.platform, process.arch);
      return assets.find((asset) =>
        matchers.every((matcher) => asset.name.match(matcher) !== null)
      );
    }

    return assets.find((asset) => asset.name === assetName);
  }
  function getMatchers(
    os: NodeJS.Platform,
    arch: NodeJS.Architecture
  ): RegExp[] {
    let out = new Array<RegExp>();
    switch (os) {
      case "win32":
        out.push(/.*windows.*/);
        break;
      case "linux":
        out.push(/.*linux.*/);
        break;
      case "darwin":
        out.push(/.*macos.*/);
        break;
      default:
        throw new Error(`Unsupported platform ${os}. Please open an issue`);
    }

    switch (arch) {
      case "arm":
        out.push(/.*(arm32|armv6hf).*/);
        break;
      case "arm64":
        out.push(/.*(arm64|aarch64).*/);
        break;
      case "x64":
        out.push(/.*(x64|linux64|windows64|macosx).*/);
        break;
      // Apparently no x86 32 bit
      default:
        throw new Error(
          `Unsupported architecture ${arch}. Please open an issue`
        );
    }

    return out;
  }
  function extractTool(path: string, type: ArchiveType): Promise<string> {
    switch (type) {
      case "application/zip":
        return tc.extractZip(path, "extracted-processing");
      case "application/gzip":
        return tc.extractTar(path, "extracted-processing");
    }
  }
}

async function run() {
  const tag = core.getInput("tag") || undefined;
  const assetName = core.getInput("asset-name") || undefined;
  core.debug(
    `Attempting to find release with the following tag: ${
      tag ?? "(Infered, none given)"
    }`
  );
  const release = await getReleaseByTag(REPOSITORIES, tag);
  core.debug(`Found release: ${JSON.stringify(release)}`);

  core.debug(`Trying to locate existing Processing installation`);
  let semverTag = coerce(release.tag)!.format();
  let cachedDirectory = tc.find("processing", semverTag);
  if (cachedDirectory) {
    core.info(`Processing (${release.tag}) is already cached. Aborting...`);
    core.addPath(cachedDirectory);
    return;
  }

  core.debug(
    `Attempting to download release asset with the following assetName: ${
      assetName ?? "(Infered, none given)"
    }`
  );
  const installPath = await installAsset(semverTag, release.assets, assetName);
  core.debug(`Processing successfully installed!`);
}

try {
  run();
} catch (error: any) {
  core.setFailed(error.message);
}
