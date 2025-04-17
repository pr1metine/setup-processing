# setup-processing

[![CI with Linux](https://github.com/ifP1/setup-processing/workflows/CI%20with%20Linux/badge.svg)](https://github.com/pr1metine/setup-processing/actions?query=workflow%3A%22CI+with+Linux%22)
[![CI with Windows](https://github.com/ifP1/setup-processing/workflows/CI%20with%20Windows/badge.svg)](https://github.com/pr1metine/setup-processing/actions?query=workflow%3A%22CI+with+Windows%22)
[![CI with MacOS](https://github.com/ifP1/setup-processing/workflows/CI%20with%20MacOS/badge.svg)](https://github.com/pr1metine/setup-processing/actions?query=workflow%3A%22CI+with+MacOS%22)
[![GitHub issues](https://img.shields.io/github/issues/ifP1/setup-processing)](https://github.com/pr1metine/setup-processing/issues)

Sets up the Processing SDK. Given a tag name and a release asset name, `setup-processing` will try to download a release asset from [Processing 4](https://github.com/processing/processing4/releases) or [Processing](https://github.com/processing/processing/releases).

## Note

- **🚨🚨🚨 Please note that this action DOES NOT work with processing revision 1300 or newer (i.e., >=4.4.0)🚨🚨🚨**
  - This is because installation files of these revisions do not follow folder structure conventions of previous revisions. Supporting installation of these versions would significantly complicate this GH action.
  - Please use their MSI / DMG / snap installer instead for installing processing. Check out the attached files of a processing release, e.g., [the release page for 4.4.0](https://github.com/processing/processing4/releases/tag/processing-1300-4.4.0).
- If no tag name `tag` is provided, the latest release will be used.
- If no asset name `asset-name` is provided, this action will try to choose the right asset based on the Action Runner's OS and CPU architecture.
- This action uses `github.token` to extend the [GitHub release fetching rate limit](https://docs.github.com/en/rest/overview/resources-in-the-rest-api?apiVersion=2022-11-28#rate-limits-for-requests-from-github-actions). You may change the used token with the Action input `token`

## Usage

Check these [example workflows](.github/workflows/).

## Example

Check this [action.yaml](action.yml) for more information.

```yaml
- name: Setup Processing
  id: setup-processing
  uses: pr1metine/setup-processing@v2.2.0
  with:
    # Tag of Processing GitHub Release, e.g. processing-1292-4.2
    # See https://github.com/processing/processing4/releases and
    # https://github.com/processing/processing4/releases
    tag: "processing-1292-4.2" # optional, will use latest release by default
    # Name of a Processing GitHub Release Asset, e.g. processing-4.2-linux-arm64.tgz
    asset-name: "processing-4.2-linux-x64.tgz" # optional, will infer based on Runner by default
- name: Output Processing installation directory
  run: echo "${{steps.setup-processing.outputs.install-dir}}"
```

## Development

- I currently use Node v20.4.0
- [This file](src/index.ts) serves as this Action's entry point.
- Use [act](https://github.com/nektos/act) to test this GitHub Action locally before pushing.
