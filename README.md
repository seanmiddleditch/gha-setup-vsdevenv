setup-vsdevenv
==============

[GitHub Action](https://github.com/features/actions) for setting Visual Studio
build environment variables and paths for subsequent steps in the job.

This can be especially useful for building C++ using the MSVC compiler using
build tools like [CMake](https://cmake.org/) which lack the good sense to find
VS themselves.

Inputs
------

- `vswhere`: Specify the path to a `vswhere.exe` executable.

Outputs
-------

- 'install_path': Selected VS installation path.

License
-------

MIT License. See [LICENSE](LICENSE) for details.

Usage Example
-------------

```
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