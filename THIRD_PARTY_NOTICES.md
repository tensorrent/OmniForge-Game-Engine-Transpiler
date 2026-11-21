# Third-party notices

The compiled bundle in `assets/` contains code from the third-party packages below. Their licences
apply to that code; the SIP License v1.1 in [LICENSE.txt](./LICENSE.txt) covers only the OmniForge
work itself.

Package names come from the landing app's `package.json`; versions are the ones installed for the
build. Packages declared there but not present in this bundle (three, @react-three/fiber,
@react-three/drei, @react-three/rapier, @react-three/postprocessing, @dimforge/rapier3d-compat) are
not listed.

| Package | Version | Licence | Copyright |
|---|---|---|---|
| react (including `react/jsx-runtime`) | 18.3.1 | MIT | Facebook, Inc. and its affiliates |
| react-dom | 18.3.1 | MIT | Facebook, Inc. and its affiliates |
| scheduler (a react-dom dependency) | 0.23.2 | MIT | Facebook, Inc. and its affiliates |
| Vite module-preload helper (inserted by the build) | 5.4.21 | MIT | VoidZero Inc. and Vite contributors |

## SPROUT components

The `.sprz` format code in the bundle comes from the SPROUT project's `@sprout/bussing-sdk`
package (version 1.0.0). SPROUT is a third-party project, not a TensorRent product. Its
`package.json` declares no licence; the terms under which that code is included are to be confirmed
with the SPROUT authors.

## MIT License (react, react-dom, scheduler)

```
MIT License

Copyright (c) Facebook, Inc. and its affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## MIT License (Vite)

```
MIT License

Copyright (c) 2019-present, VoidZero Inc. and Vite contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
