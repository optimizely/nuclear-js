import React from 'react'
import Wrapper from '../layouts/wrapper'
import ItemFilterExample from '../components/item-filter-example'
import UsageExample from '../components/usage-example'
import Nav from '../components/nav'

export default React.createClass({
  render() {
    return <Wrapper>
      <Nav />
      <div className="hero hero--bg" id="index-banner">
        <div className="container">
          <h1 className="header center white-text">NuclearJS</h1>
          <div className="row center">
            <h3 className="header col s12 light white-text">
              Reactive Flux built with ImmutableJS data structures.
            </h3>
          </div>
          <div className="row center">
            <iframe src="https://ghbtns.com/github-btn.html?user=optimizely&repo=nuclear-js&type=star&count=true&size=large" frameBorder="0" scrolling="0" width="140px" height="30px"></iframe>
          </div>
        </div>
      </div>

      <div className="tour-section">
        <div className="container">
          <div className="row">
            <div className="col s12 m12 l5 valign-wrapper">
              <div className="valign">
                <h2 className="red-text tour-section--title">
                  Simple & Elegant Flux
                </h2>

                <h3 className="tour-section--bullet-title">
                  Singular application state
                </h3>
                <p className="tour-section--bullet-item">
                  All application state is stored in one Immutable Map, similar to <a href="https://github.com/omcljs/om" target="_blank">Om</a>.
                </p>
                <p className="tour-section--bullet-item">
                  Stores declaratively register pure functions to handle state changes, massively simplifying testing and debugging state changes.
                </p>

                <h3 className="tour-section--bullet-title">
                  Powerful functional dataflow
                </h3>
                <p className="tour-section--bullet-item">
                  Compose and transform your data together statelessly and efficiently using a functional lens concept called <strong>Getters</strong>.
                </p>
                <p className="tour-section--bullet-item">
                   This allows your views to receive exactly the data they need in a way that is fully decoupled from stores. Best of all, this pattern eliminates the confusing <code>store.waitsFor</code> method found in other Flux implementations.
                </p>

                <h3 className="tour-section--bullet-title">
                  Reactive
                </h3>
                <p className="tour-section--bullet-item">
                  Any Getter can be observed by a view to be notified whenever its derived value changes.
                </p>
                <p className="tour-section--bullet-item">
                  NuclearJS includes tools to integrate with libraries such as React and VueJS out of the box.
                </p>

                <h3 className="tour-section--bullet-title">
                  Efficient
                </h3>
                <p className="tour-section--bullet-item">
                  Thanks to immutable data, change detection can be efficiently performed at any level of granularity by a constant time reference equality <code>(===)</code> check.
                </p>
                <p className="tour-section--bullet-item">
                  Since Getters use pure functions, NuclearJS utilizes memoization to only recompute parts of the dataflow that might change.
                </p>
              </div>
            </div>

            <div className="col s12 m12 l6 offset-l1 tour-section--example">
              <ItemFilterExample />
            </div>
          </div>
        </div>
      </div>

      <div className="tour-section tour-section--bg">
        <div className="container">
          <h2 className="red-text tour-section--title">
            Usage:
          </h2>

          <UsageExample />
        </div>
      </div>

      <div className="tour-section">
        <div className="container">
          <div className="row">
            <div className="col s12 m12 l6 tour-section--info">
              <h2 className="red-text tour-section--title">
                Tested & Production Ready
              </h2>

              <h3 className="tour-section--bullet-title">
                Maintained by Optimizely
              </h3>
              <p className="tour-section--bullet-item">
                Optimizely has been using NuclearJS in production since 2014 and will offer long term support and a stable API.
              </p>

              <h3 className="tour-section--bullet-title">
                Easy debugging
              </h3>
              <p className="tour-section--bullet-item">
                With NuclearJS' built in logger you can inspect your application state from the beginning of time. NuclearJS makes tracking down difficult bugs
                a breeze, allowing you to focus more time writing code.
              </p>

              <h3 className="tour-section--bullet-title">
                Testable
              </h3>
              <p className="tour-section--bullet-item">
                When building with NuclearJS there is never a question of "How do I test this?". There are prescribed testing strategies
                for every type of thing you will build with NuclearJS.
              </p>

              <h3 className="tour-section--bullet-title">
                Prescribed code organization structure
              </h3>

              <p>
                For large codebases the prescribed way of organization is to group all stores, actions and getters of the same domain in a module.
              </p>

              <p>
                This method of code organization is extremely portable, making it almost trivial to refactor, split code into multiple bundles and create contracts between modules.
              </p>

              <p>
                In fact, Optimizely's codebase has over 50 modules and is growing everyday.  Using this pattern makes it easy for teams to consume other teams modules, leading to
                great code reusability.
              </p>
            </div>

            <div className="col s12 m12 l5 offset-l1 tour-section--example">
              <img src="assets/img/debug_console.jpg" width="750px" alt="" />
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  }
})
