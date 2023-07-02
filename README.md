# setup-processing

[![CI with Linux](https://github.com/ifP1/setup-processing/workflows/CI%20with%20Linux/badge.svg)](https://github.com/pr1metine/setup-processing/actions?query=workflow%3A%22CI+with+Linux%22)
[![CI with Windows](https://github.com/ifP1/setup-processing/workflows/CI%20with%20Windows/badge.svg)](https://github.com/pr1metine/setup-processing/actions?query=workflow%3A%22CI+with+Windows%22)
[![CI with MacOS](https://github.com/ifP1/setup-processing/workflows/CI%20with%20MacOS/badge.svg)](https://github.com/pr1metine/setup-processing/actions?query=workflow%3A%22CI+with+MacOS%22)
[![GitHub issues](https://img.shields.io/github/issues/ifP1/setup-processing)](https://github.com/pr1metine/setup-processing/issues)

Sets up the Processing SDK. Given a tag name and a release asset name, `setup-processing` will try to download a release asset from [Processing 4](https://github.com/processing/processing4/releases) or [Processing](https://github.com/processing/processing/releases).

## Note

- If no tag name `tag` is provided, the latest release will be used.
- If no asset name `asset-name` is provided, this action will try to choose the right asset based on the Action Runner's OS and CPU architecture.

## Code

```yaml
- name: Setup Processing
  uses: pr1metine/setup-processing@v2.0.0
  with:
    # Tag of Processing GitHub Release, e.g. processing-1292-4.2
    # See https://github.com/processing/processing4/releases and
    # https://github.com/processing/processing4/releases
    tag: # optional, will use latest release by default
    # Name of a Processing GitHub Release Asset, e.g. processing-4.2-linux-arm64.tgz
    asset-name: # optional, will infer based on Runner by default
```

## Development

[This file](src/index.ts) serves as this Action's entry point. Use [act](https://github.com/nektos/act) to test this GitHub Action locally before pushing.
