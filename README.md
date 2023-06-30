# setup-processing

[![CI with Linux](https://github.com/ifP1/setup-processing/workflows/CI%20with%20Linux/badge.svg)](https://github.com/ifP1/setup-processing/actions?query=workflow%3A%22CI+with+Linux%22)
[![CI with Windows](https://github.com/ifP1/setup-processing/workflows/CI%20with%20Windows/badge.svg)](https://github.com/ifP1/setup-processing/actions?query=workflow%3A%22CI+with+Windows%22)
[![CI with MacOS](https://github.com/ifP1/setup-processing/workflows/CI%20with%20MacOS/badge.svg)](https://github.com/ifP1/setup-processing/actions?query=workflow%3A%22CI+with+MacOS%22)
[![GitHub issues](https://img.shields.io/github/issues/ifP1/setup-processing)](https://github.com/ifP1/setup-processing/issues)

Sets up the Processing SDK. Will try to fetch https://processing.org/download/processing-${version}-${platform-filetype}

## Code

```yaml
- name: Setup Processing
  uses: ifP1/setup-processing@v1.1.1
  with:
    # Version of Processing, e.g. 3.5.4
    version: # default is 3.5.4
    # e.g. 'windows64.zip', 'windows32.zip', 'linux64.tgz'
    platform-filetype: # optional, default is linux64.tgz
```
