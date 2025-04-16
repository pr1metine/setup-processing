type Repository = {
  owner: string;
  repo: string;
};

type ArchiveType =
  | "application/zip"
  | "application/gzip"
  | "application/octet-stream"
  | "application/x-compressed"
  | "application/x-zip-compressed"
  | "binary/octet-stream";

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
