# TODO for 0.6.0

## Essential for 0.6.0
- [x] Flux chat example written in NuclearJS (only need README)
- [x] Implement `flux.ReactMixin` as part of NuclearJS
- [x] Test `flux.ReactMixin`
- [x] Dedupe docs and make sure they are organized
- [x] Document module pattern and prescribed way of testing NuclearJS modules
- [x] Document util methods such as `toImmutable`
- [x] Ensure that flux.observe is called correctly when using mutable POJO data
- [x] Create release documentation with API breaking changes and migration guide

## Planned for 0.6.1
- [ ] Implement code coverage and add badge
- [x] Implement travis CI and add test passing badge
- [ ] Add npm badge
- [ ] Explain `getters` with diagram as functional lenses
- [x] Polyfill all lodash methods in `utils` taken from 0.5.0 (only need `deepClone` and `isObject`)
