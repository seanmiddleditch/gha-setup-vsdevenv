setup-vsdevenv
==============

[GitHub Action](https://github.com/features/actions) for setting Visual Studio
build environment variables and paths for subsequent steps in the job.

This can be especially useful for building C++ using the MSVC compiler using
build tools like [CMake](https://cmake.org/) which lack the good sense to find
VS themselves.

See [action.yml](https://github.com/potatoengine/ghactions/blob/master/setup-vsdevenv/action.yml)
for a complete list of inputs and outputs.

License
-------

MIT License, see [LICENSE](https://github.com/potatoengine/ghactions/blob/master/setup-vsdevenv/LICENSE)
for details.

Usage Example
-------------

```
jobs:
  publish:
    - uses: actions/checkout@master
    - uses: potatoengine/ghactions/setup-vsdevenv@master
    - run: mkdir build && cd build && cmake -DCMAKE_CXX_COMPILER=cl.exe ..
    - run: cmake --build build
```