type Repository = {
  owner: string;
  repo: string;
};

type ArchiveType =
  | "application/zip"
  | "application/gzip"
  | "application/octet-stream";

type ReleaseAsset = {
  name: string;
  url: string;
  content_type: ArchiveType;
};

type Release = {
  tag: string;
  assets: ReleaseAsset[];
};

export { Repository, ArchiveType, ReleaseAsset, Release };
