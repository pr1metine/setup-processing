import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";

import { ArchiveType, Release, Repository } from "./types";

let OCTOKIT = new Octokit({
  auth: core.getInput("token"),
  userAgent: "GitHub Action 'setup-processing'",
});

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
    results
      //   .map((result) => {
      //     core.debug(`${JSON.stringify(result)}`);
      //     return result;
      //   })
      .filter(isFulfilled)
      .map((result) => result.value)
  );

  let successfullyRetrievedReleases = releases.filter(
    (release) => release.status >= 200 && release.status < 300
  );

  if (successfullyRetrievedReleases.length < 1) {
    throw new Error(
      `Could not find a Processing release for the following tag: ${JSON.stringify(
        tag
      )}, releases.length=${releases.length}`
    );
  }

  let release = successfullyRetrievedReleases[0].data;

  core.debug(`Pruning asset descriptions: ${JSON.stringify(release.assets)}`);
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
}

const isFulfilled = <T>(
  input: PromiseSettledResult<T>
): input is PromiseFulfilledResult<T> => input.status === "fulfilled";

function getArchiveType(content_type: string): ArchiveType {
  if (
    content_type !== "application/zip" &&
    content_type !== "application/gzip" &&
    content_type !== "application/octet-stream" &&
    content_type !== "application/x-compressed" &&
    content_type !== "application/x-zip-compressed" &&
    content_type !== "binary/octet-stream"
  ) {
    throw new Error(
      `Unsupported archive type: ${content_type}. Please file an issue`
    );
  }

  return <ArchiveType>content_type;
}

export default getReleaseByTag;
