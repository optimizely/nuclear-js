# Contributing to NuclearJS

Welcome to NuclearJS!
If you are reading this, it probably means that you are interested in contributing to this awesome open source project.
To make the process of contributing more straightforward, we have prepared this guideline for you.
To learn more about NuclearJS, check out our new [developer website!](https://optimizely.github.io/nuclear-js/)

## Development Setup

First of all, you will want to [fork](https://help.github.com/articles/fork-a-repo/) this repo and then clone it locally.

Next, you will need to have the following technologies installed: Node, grunt and all the other dependencies.

1. Install [Node.](https://nodejs.org/download/)
2. Install [Grunt](http://gruntjs.com/getting-started) to run the unit tests. `npm install -g grunt-cli`
3. Install all the other dependencies by running: `npm install` in the nuclear-js directory.

## Testing

`grunt test`

To test using Chrome, run: `grunt karma:chrome`

To run unit tests in PhantomJS + Coverage run: `grunt karma:coverage`

## Style Guide

Nothing special here. Just write good, clean JavaScript. We've made it easier to check your styling now by using [eslint.](http://eslint.org/) To get instant feedback on any styling violations, simply run: `grunt eslint`

Some general rules:

 - 2 space indentation (no tabs).
 - Prefer `'` over `"`.
 - No semicolons unless necessary.
 - Last element in an array should be followed with a comma.
 - Always use brackets for functions even if it is a one-liner.
 - When in doubt, refer to the source code and follow that styling.

## Submitting Issues and Pull Requests

### Issue Reporting Checklist

 - [ ] Make sure that you are using the latest version of NuclearJS.
 - [ ] Before submitting an issue, try to search around as it may have already been answered or even fixed.
 - [ ] If you still can not find a valid answer, feel free to open up an issue and we will happy take a look for you.

### Sending in a Pull Request Checklist

 - [ ] Work only in the `src` folder and please DO NOT check in anything in the `dist` folder.
 - [ ] Follow the [Style Guide.](https://github.com/optimizely/nuclear-js/blob/master/CONTRIBUTING.md#style-guide) Make sure that there are no lint errors or warnings after running: `grunt eslint`
 - [ ] Squash commits that are very small and redundant.
 - [ ] Make sure all tests pass after running: `grunt test`
 - [ ] If you are implementing a new feature, be sure to add new tests for that feature.
 - [ ] Provide us with a detailed description of commits and changes.
