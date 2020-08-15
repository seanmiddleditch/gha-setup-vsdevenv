setup-vsdevenv
==============

[GitHub Action](https://github.com/features/actions) for setting Visual Studio
build environment variables and paths for subsequent steps in the job.

This can be especially useful for building C++ using the MSVC compiler using
build tools like [CMake](https://cmake.org/) which lack the good sense to find
VS themselves.

The action can find any compatible VS installation (via required [VS components](
https://docs.microsoft.com/en-us/visualstudio/install/workload-and-component-ids
)), though it will still always run the `vsdevenv` command and update the
environment accordingly.

Inputs
------

- `vswhere`: Path to `vswhere.exe` (default system-installed copy).
- `arch`: Build architecture (default `amd64`).
- `host_arch`: Host architecture (default `x86`).
- `winsdk`: WinSDK version override.
- `toolset_version`: Build toolset version override.
- `components`: List of required VS components, semi-colon separated.
  (default `Microsoft.VisualStudio.Component.VC.Tools.x86.x64`)

Outputs
-------

- `install_path`: Selected VS installation path.

License
-------

MIT License. See [LICENSE](LICENSE) for details.

Usage Example
-------------

```yaml
jobs:
  build:
    - uses: actions/checkout@master
    - uses: seanmiddleditch/gha-setup-vsdevenv@master
    - run: |
        mkdir build
        cd build
        cmake -DCMAKE_CXX_COMPILER=cl.exe ..
    - run: cmake --build build
```
