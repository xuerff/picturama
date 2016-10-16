PATH  := $(PWD)/node_modules/.bin:$(PATH)
SHELL := /bin/bash

# Electron's version.
npm_config_target=1.4.1
# The architecture of Electron, can be ia32 or x64.
npm_config_arch=x64
npm_config_target_arch=x64
# Download headers for Electron.
npm_config_disturl=https://atom.io/download/atom-shell
# Tell node-pre-gyp that we are building for Electron.
npm_config_runtime=electron
# Tell node-pre-gyp to build module from source code.
npm_config_build_from_source=true

all:
	rm -rf build dist
	babel src --out-dir dist
	mkdir build
	mkdir build/prepared
	cp dist build/prepared -r
	cp package.json build/prepared
	cp keymaps build/prepared -r
	cp menus build/prepared -r
	cp migrations build/prepared -r
	cp static build/prepared -r
	cd build/prepared; \
		npm install --production --ignore-scripts; \
		electron-rebuild;
	cd build/prepared/node_modules/udev; \
		node-gyp configure --module_name=udev --module_path=build/prepared/node_modules/lib/binding/electron-v1.4-linux-x64; \
		node-gyp rebuild --runtime=electron --target=1.4.1 --arch=x64 --target_platform=linux --dist-url=https://atom.io/download/atom-shell --module_name=udev --module_path=build/prepared/node_modules/lib/binding/electron-v1.4-linux-x64;
	electron-packager build/prepared ansel --platform=linux --arch=x64 --no-prune --out=build
