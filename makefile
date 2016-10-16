PATH  := $(PWD)/node_modules/.bin:$(PATH)
SHELL := /bin/bash

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
	cd build/prepared; npm install --production --ignore-scripts; \
		#npm run rebuild-exiv2; \
		#npm run rebuild-libraw; \
		#npm run rebuild-sharp; \
		#npm run rebuild-udev; \
		#npm run rebuild-sqlite3; \
		electron-rebuild;
	electron-packager build/prepared ansel --platform=linux --arch=x64 --no-prune --out=build
