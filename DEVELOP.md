How to develop Ansel
====================


Build from sources
------------------

```bash
npm install
npm start
```

If you get an error with `node-gyp rebuild` then delete `~/.node-gyp` and try again:

```bash
rm -rf ~/.node-gyp
```



UI sandbox
----------

1. Run Ansel:
    ```bash
    npm start
    ```

2. Run watch build (in extra console):
    ```bash
    npm run watch
    ```

3. Open the UI sandbox: `Shift`+`Ctrl`+`S` (On Mac: `Alt`+`Cmd`+`S`)

4. Change some React code and save

5. Wait for the watch build to build the changes

6. Reload UI sandbox: `Shift`+`Ctrl`+`R` (On Mac: `Cmd`+`Shift`+`R`)



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
