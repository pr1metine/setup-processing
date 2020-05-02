# setup-processing
![CI](https://github.com/ifP1/setup-processing/workflows/CI/badge.svg)
[![GitHub issues](https://img.shields.io/github/issues/ifP1/setup-processing)](https://github.com/ifP1/setup-processing/issues)
[![GitHub forks](https://img.shields.io/github/forks/ifP1/setup-processing)](https://github.com/ifP1/setup-processing/network)
[![GitHub stars](https://img.shields.io/github/stars/ifP1/setup-processing)](https://github.com/ifP1/setup-processing/stargazers)

Eine "GitHub Action" zum Installieren von Processing für CI/CD

## Code
```yaml
- name: Setup Processing
  uses: ifP1/setup-processing@v1.0.0
  with:
    # Version of Processing, e.g. 3.5.4
    version: 
    # e.g. 'windows64.zip', 'windows32.zip', 'linux64.tgz', 'macosx.zip'
    platform-filetype: # optional, default is linux64
```