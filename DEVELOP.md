How to develop Ansel
====================


Directory structure
-------------------

    +-- src/
      +-- background/         Code running in main electron process
      +-- common/             Shared code
      +-- sandbox/            Code running in renderer electron process of sandbox UI
      +-- ui/                 Code running in renderer electron process of main UI


Build from sources
------------------

Prerequirements:

  - Install yarn (Mac OS: `brew install yarn`)
    - **Note:** It's important to use yarn instead of npm for
      [getting smaller distributable packages](https://github.com/electron-userland/electron-builder/issues/1147#issuecomment-276284477)
  - Mac OS: Install Xcode and start it once. You can close Xcode after the "required components" have been installed.


```bash
yarn
yarn start
```

If you get an error with `node-gyp rebuild` then delete `~/.node-gyp` and try again:

```bash
rm -rf ~/.node-gyp
yarn
```



UI sandbox
----------

1. Run watch build:
    ```bash
    yarn run watch
    ```

2. Run Ansel (in extra console):
    ```bash
    yarn run start-no-build
    ```

3. Open the UI sandbox: `Shift`+`Ctrl`+`S` (On Mac: `Alt`+`Cmd`+`S`)

4. Change some React code and save

5. Wait for the watch build to build the changes

6. Reload UI sandbox: `Shift`+`Ctrl`+`R` (On Mac: `Cmd`+`Shift`+`R`)



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
