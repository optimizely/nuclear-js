# NuclearJS Docs

Doc site statically generated using `React` + `NuclearJS`.

##### For development

```sh
grunt dev
```

##### To build production static site

Compile static site to `dist/` directory

```sh
grunt generate
```

##### To deploy to gh-pages

```sh
cd docs && grunt generate
cd ../ && git subtree push --prefix docs/dist origin gh-pages
```
