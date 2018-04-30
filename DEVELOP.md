How to develop Ansel
====================


Build from sources
------------------

```bash
sudo npm install -g gulp
npm install
npm start
```


UI sandbox
----------

1. Run Ansel:
    ```bash
    npm start
    ```

2. Open the UI sandbox: `Shift`+`Ctrl`+`S` (On Mac: `Alt`+`Cmd`+`S`)

3. Change some React code

4. Rebuild (in extra console):
    ```bash
    ./node_modules/.bin/gulp transpile styles styles-sandbox
    ```

5. Reload UI sandbox: `Shift`+`Ctrl`+`R` (On Mac: `Cmd`+`Shift`+`R`)
