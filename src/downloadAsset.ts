import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { ArchiveType, ReleaseAsset } from "./types";

/**
 * Download a specified asset from a GitHub Release.
 *
 * If no assetName is given, `setup-processing` tries to infer the
 * assetName. It does so based on the OS and CPU architecture of
 * the GitHub runner.
 *
 * @param assets Available assets for a Processing release
 * @param assetName Name of the specified asset to be downloaded
 * @returns Path to extracted asset
 */
async function downloadAsset(
  assets: ReleaseAsset[],
  assetName?: string
): Promise<string> {
  let asset = getAssetByName(assets, assetName);
  if (asset === undefined) {
    throw new Error(
      `The given archive name does not exist: ${
        assetName ?? "(Infered, please open an issue for this)"
      }

      Available choices were: ${JSON.stringify(
        assets.map((asset) => asset.name)
      )}
      `
    );
  }
  core.info(`Downloading release asset "${asset.name}"`);

  let path = await extractTool(
    await tc.downloadTool(asset.url),
    asset.content_type
  );

  return path;
}

function getAssetByName(
  assets: ReleaseAsset[],
  assetName?: string
): ReleaseAsset | undefined {
  if (assetName === undefined) {
    core.info(
      `Infering correct asset file name (os=${process.platform}, arch=${process.arch})...`
    );
    let matchers = getMatchers(process.platform, process.arch);
    return assets.find((asset) =>
      matchers.every((matcher) => asset.name.match(matcher) !== null)
    );
  }

  return assets.find((asset) => asset.name === assetName);
}
function getMatchers(os: NodeJS.Platform, arch: NodeJS.Architecture): RegExp[] {
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
      throw new Error(`Unsupported architecture ${arch}. Please open an issue`);
  }

  return out;
}
function extractTool(path: string, type: ArchiveType): Promise<string> {
  switch (type) {
    case "application/x-zip-compressed":
    case "application/octet-stream":
    case "binary/octet-stream":
      core.warning(`Asset type of ${path} is "${type}". Assumed to be zip`);
    case "application/zip":
      return tc.extractZip(path, "extracted-processing");

    case "application/x-compressed":
      core.warning(`Asset type of ${path} is "${type}". Assumed to be gzip`);
    case "application/gzip":
      return tc.extractTar(path, "extracted-processing");
  }
}

export default downloadAsset;
