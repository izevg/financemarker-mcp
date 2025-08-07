SHELL := /bin/zsh

.PHONY: install build typecheck test test:watch start start:cli clean ci

install:
	npm ci

build:
	npm run build

typecheck:
	npm run typecheck

test:
	npm test

test:watch:
	npm run test:watch

start:
	npm start

start:cli:
	npm run start:cli

clean:
	npm run clean

ci: install typecheck test build

