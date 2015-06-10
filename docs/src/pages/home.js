import React from 'react'
import Wrapper from '../layouts/wrapper'
import ItemFilterExample from '../components/item-filter-example'
import UsageExample from '../components/usage-example'

export default React.createClass({
  render() {
    return <Wrapper>
      <div className="section pad-bot red darken-2" id="index-banner">
        <div className="container">
          <h1 className="header center white-text">NuclearJS</h1>
          <div className="row center">
            <h5 className="header col s12 light white-text">
              Reactive Flux built with ImmutableJS data structures.
            </h5>
          </div>
          <div className="row center">
            <iframe src="https://ghbtns.com/github-btn.html?user=optimizely&repo=nuclear-js&type=star&count=true&size=large" frameBorder="0" scrolling="0" width="140px" height="30px"></iframe>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="section tour-section">
          <div className="row">
            <div className="col s12 m12 l5 valign-wrapper">
              <div className="valign">
                <h4 className="red-text tour-section--title">
                  Simple & Elegant Flux
                </h4>

                <h5 className="tour-section--bullet-title">
                Singular application state
                </h5>
                <p className="tour-section--bullet-item">
                  All application state is stored in one Immutable Map - think <a href="https://github.com/swanodette/om">Om</a>.
                </p>

                <p className="tour-section--bullet-item">
                  Stores are stateless and declarative.  Each store in Nuclear specifies the initial state and how subsequent actions mutate that state for a section of application.
                </p>

                <h5 className="tour-section--bullet-title">
                  First class support for derived data
                </h5>
                <p className="tour-section--bullet-item">
                  Compose and transform your data together statelessly and efficiently using a functional lens concept called <strong>Getters</strong>.
                  This pattern eliminates the confusing <code>store.waitsFor</code> method found in other Flux implementations.
                </p>

                <h5 className="tour-section--bullet-title">
                  Reactive
                </h5>
                <p className="tour-section--bullet-item">
                  Nuclear can observe and react to any granularity of state change, including derived state through Getters.
                </p>

                <p className="tour-section--bullet-item">
                  Mixins and higher order components make automatic data binding between Nuclear and frameworks such as React and VueJS a breeze!
                </p>

                <h5 className="tour-section--bullet-title">
                  Efficient
                </h5>
                <p className="tour-section--bullet-item">
                  Thanks to immutable state, all change detection can be done with a constant time triple equals (<code>===</code>) check.
                </p>
              </div>
            </div>

            <div className="col s12 m12 l6 offset-l1 tour-section--example">
              <ItemFilterExample />
            </div>
          </div>

        </div>
      </div>

      <div className="tour-section--bg">
        <div className="container">
          <div className="section tour-section">
            <div className="row">
              <div className="col s12 m12 l12">
                <h4 className="red-text tour-section--title">
                  Usage:
                </h4>
              </div>
            </div>

            <UsageExample />
          </div>
        </div>
      </div>

      <div className="container">
        <div className="section tour-section">
          <div className="row">


            <div className="col s12 m12 l6 tour-section--info">
              <h4 className="red-text tour-section--title">
                Tested & Production Ready
              </h4>

              <h5 className="tour-section--bullet-title">
                Maintained by Optimizely
              </h5>
              <p className="tour-section--bullet-item">
                Optimizely has been using NuclearJS in production since 2014 and will offer long term support and a stable API.
              </p>

              <h5 className="tour-section--bullet-title">
                Easy debugging
              </h5>
              <p className="tour-section--bullet-item">
                With NuclearJS' built in logger you can inspect your application state from the beginning of time. NuclearJS makes tracking down difficult bugs
                a breeze, allowing you to focus more time writing code.
              </p>

              <h5 className="tour-section--bullet-title">
                Testable
              </h5>
              <p className="tour-section--bullet-item">
                When building with NuclearJS there is never a question of "How do I test this?". There are prescribed testing strategies
                for every type of thing you will build with NuclearJS.
              </p>

              <h5 className="tour-section--bullet-title">
                Prescribed code organization structure
              </h5>

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
              <img src="img/debug_console.jpg" width="750px" alt="" />
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  }
})
