How to develop Ansel
====================



Directory structure
-------------------

    +-- dist/                 Build artifacts of the app (filled by `webpack`)
    +-- dist-package/         Build artifacts when creating distributable packages (filled by `electron-builder`)
    +-- doc/                  Resources used by documentation
    +-- migrations/           DB migration scripts
    +-- src/
        +-- app/              Code running in renderer electron process of main UI
        +-- background/       Code running in main electron process
        +-- common/           Shared code
        +-- package/          Resources needed for creating distributable packages (used by `electron-builder`)
        +-- static/           Static files to be copied directly to `dist`
        +-- test-ui/          Code running in renderer electron process of UI Tester
        +-- typings/          TypeScript type definitions
    +-- submodules/           Third-party projects fetched as git submodules
    +-- test-data/            Data used for testing



Build from sources
------------------

Prerequirements:

  - Install yarn (Mac OS: `brew install yarn`)
    - **Note:** It's important to use yarn instead of npm for
      [getting smaller distributable packages](https://github.com/electron-userland/electron-builder/issues/1147#issuecomment-276284477)
  - Mac OS: Install Xcode and start it once. You can close Xcode after the "required components" have been installed.

Fetch git submodules:

    git submodule update --init --recursive

Fetch dependnencies and build and start Ansel:

```bash
yarn
yarn start
```

If you get an error with `node-gyp rebuild` then delete `~/.node-gyp` and try again:

```bash
rm -rf ~/.node-gyp
yarn
```



Build distributable package
---------------------------

Build distributable package:

    yarn run package

Cross-build linux package on Mac OS or Windows:

  1.  Run docker container:

          docker run --rm -ti \
          --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|  CIRCLETRAVIS_TAG|TRAVIS|TRAVIS_REPO_|TRAVIS_BUILD_|  TRAVIS_BRANCHTRAVIS_PULL_REQUEST_|APPVEYOR_|CSC_|GH_|GITHUB_|BT_|AWS_|  STRIP|BUILD_') \
          --env ELECTRON_CACHE="/root/.cache/electron" \
          --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
          -v ${PWD}:/project \
          -v ${PWD##*/}-node-modules:/project/node_modules \
          -v ~/.cache/electron:/root/.cache/electron \
          -v ~/.cache/electron-builder:/root/.cache/electron-builder \
          electronuserland/builder

  2.  Build `dist-package/Ansel-xyz.deb` for Linux (in docker container):

          yarn && yarn run package

Cross-build windows package on Mac OS or Linux:

  - Log in to [AppYeyor](https://www.appveyor.com/)
  - Create a project for Ansel:
    - Type: "Git"
    - In Settings -> General set "Custom configuration .yml file name" to `https://raw.githubusercontent.com/ansel-app/ansel/master/appveyor.yml`
  - Click "New build" on the project details screen.

For more details see:

  - https://www.electron.build/multi-platform-build
  - https://github.com/appveyor/ci/issues/1089#issuecomment-264549196



UI Tester
---------

1. Run watch build:
    ```bash
    yarn run watch
    ```

2. Run Ansel (in extra console):
    ```bash
    yarn run start-no-build
    ```

3. Open the UI Tester: `Shift`+`Ctrl`+`T` (On Mac: `Alt`+`Cmd`+`T`)

4. Change some React code and save

5. Wait for the watch build to build the changes

6. Reload UI Tester: `Shift`+`Ctrl`+`R` (On Mac: `Cmd`+`Shift`+`R`)



Developing main process code
----------------------------

If you change code that runs in the main process, you have to restart Ansel each time in order to see your changes.
Here's how you can use a watch build in order to reduce turnaround time:

1. Run watch build (in extra console):
    ```bash
    yarn run watch
    ```

2. Change your code.

3. Restart Ansel without building (since building is done by the watch):
    ```bash
    yarn run start-no-build
    ```



Debug main process
------------------

Main process debugging is already pre-configured in `.vscode/launch.json`.

So debugging is easy:

1. Open project in [VS Code](https://code.visualstudio.com/)

2. Start debugging in the Debug View



Build distributable package
---------------------------

Build whole project from scratch:

    yarn run release

Build distributable package only (use existing `dist` folder):

    yarn run package

Only generate the package directory without really packaging it (This is useful for testing purposes):

    yarn run package-dir

**Hint:** In order check what is packed, add a `"asar": false` to the `build`-Object of `package.json`, then run
`yarn run package-dir` and check the folder `dist-package/mac/Ansel.app/Contents/Resources/app`



CSS naming conventions
----------------------

Inspired by: [SUIT CSS naming conventions](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md)

CSS example:

```css
// Component:
// - CamelCase uppercase
.MyComponent { ... }

// Status:
// - camelCase lowercase with prefix `is` or `has`
// - Always combined with another class
.MyComponent.isExpanded { ... }

// Component children:
// - camelCase lowercase with component name plus a minus as prefix
.MyComponent-header { ... }
```

less template:

```less
// Component
.MyComponent {
    ...

    // Status
    &.isExpanded {
        ...
    }
}

// Component child
.MyComponent-header {
    ...
}
```

HTML example:

```html
<div class="MyComponent isExpanded">
    <div class="MyComponent-header">...</div>
</div>
```
