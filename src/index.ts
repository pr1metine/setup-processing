import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";

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

  core.debug(
    `getReleaseByTag: repos=${JSON.stringify(repos)}, tag=${JSON.stringify(
      tag
    )}`
  );

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

  core.debug(
    `Successfully retrieved releases: ${JSON.stringify(
      successfullyRetrievedReleases
    )}`
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

async function downloadAsset(
  assets: ReleaseAsset[],
  archiveName?: string
): Promise<string> {
  if (archiveName !== undefined) {
    let asset = assets.find((asset) => asset.name === archiveName);
    if (asset === undefined) {
      throw new Error(`The given archive name does not exist: ${archiveName}`);
    }

    return extractTool(await tc.downloadTool(asset.url), asset.content_type);
  }

  core.info(`Determining correct asset file name...`);
  getMatchers(process.platform, process.arch);

  return "what?";

  function getMatchers(
    os: NodeJS.Platform,
    arch: NodeJS.Architecture
  ): RegExp[] {
    switch (os) {
      case "win32":
      case "cygwin":

      case "linux":
      case "android":

      case "darwin":

      case "aix":
      case "freebsd":
      case "haiku":
      case "openbsd":
      case "sunos":
      case "netbsd":
    }
    return [];
  }
  function extractTool(path: string, type: ArchiveType): Promise<string> {
    switch (type) {
      case "application/zip":
        return tc.extractZip(path);
      case "application/gzip":
        return tc.extractTar(path);
    }
  }
}

async function run() {
  const release = await getReleaseByTag(REPOSITORIES, "processing-1292-4.2");
  core.debug(`Release: ${JSON.stringify(release)}`);
  const installPath = await downloadAsset(
    release.assets,
    "processing-4.2-linux-x64.tgz"
  );
}

try {
  run();
} catch (error: any) {
  core.setFailed(error.message);
}
