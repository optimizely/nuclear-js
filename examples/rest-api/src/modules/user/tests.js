require('blanket')({
  pattern: [
    '/modules/user',
    'mock-server',
  ],
})

var chai = require('chai')
var spies = require('chai-spies')
var expect = chai.expect
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
chai.use(sinonChai)
chai.use(spies)

var Flux = require('../../flux')
var MockServer = require('../../mock-server')
var User = require('./index')

describe('modules/user', function() {
  var userData

  beforeEach(function() {
    userData = {
      1: {
        id: 1,
        name: 'jordan',
        email: 'jordan@nuclear.com',
      },
      2: {
        id: 2,
        name: 'jane',
        email: 'jane@nuclear.com',
      },
    }

    sinon.stub(MockServer, '__getData')
    MockServer.__getData.withArgs('user').returns(userData)
  })

  afterEach(function() {
    MockServer.__getData.restore()
    Flux.reset()
  })

  describe('#fetchAll', function() {
    it('should load users into the restApiCache', function(done) {
      User.actions.fetchAll().then(function() {
        var users = Flux.evaluateToJS(User.getters.entityMap)
        expect(users).to.deep.equal(userData)
        done()
      }).catch(done)
    })
  })

  describe('#fetch', function() {
    it('should load the fetched user into the restApiCache', function(done) {
      var id = 1
      User.actions.fetch(id).then(function() {
        var users = Flux.evaluateToJS(User.getters.entityMap)
        expect(users[id]).to.deep.equal(userData[id])
        done()
      }).catch(done)
    })

    it('should reject the promise when there is no entity for that id', function(done) {
      var id = 4
      User.actions.fetch(id).then(
        function() {
          done('In success handler')
        },
        function() {
          done()
        }
      ).catch(done)
    })
  })

  describe('#delete', function() {
    describe('when users have been loaded into the restApiCache', function() {
      beforeEach(function(done) {
        User.actions.fetchAll().then(function(results) {
          done()
        })
      })

      it('should remove the user from the restApiCache', function(done) {
        var user = userData[1]
        User.actions.delete(user).then(function() {
          var user1 = Flux.evaluateToJS(User.getters.byId(1))
          var user2 = Flux.evaluateToJS(User.getters.byId(2))
          expect(user1).to.be.undefined
          expect(user2).to.exist
          done()
        }).catch(done)
      })

      it('should reject the promise when no user has been found', function(done) {
        var user = { id: 4 }
        User.actions.delete(user).then(
          function() {
            done('In success handler')
          },
          function() {
            var user1 = Flux.evaluateToJS(User.getters.byId(1))
            var user2 = Flux.evaluateToJS(User.getters.byId(2))
            expect(user1).to.deep.equal(userData[1])
            expect(user2).to.deep.equal(userData[2])
            done()
          }
        ).catch(done)
      })
    })
  })

  describe('#save', function() {
    describe('with an id', function() {
      it('should update the restApiCache', function(done) {
        var instance = {
          id: 1,
          name: 'jordan2',
          email: 'jordan@nuclear.com',
        }
        User.actions.save(instance).then(function() {
          var savedInstance = Flux.evaluateToJS(User.getters.byId(instance.id))
          expect(savedInstance).to.deep.equal(instance)
          done()
        }).catch(done)
      })

      it('should reject the promise if no entity exists with that id', function(done) {
        var instance = {
          id: 4,
          name: 'jordan2',
          email: 'jordan@nuclear.com',
        }
        User.actions.save(instance).then(
          function() {
            done('In success handler')
          },
          function() {
            done()
          }
        ).catch(done)
      })
    })

    describe('without an id', function() {
      it('should insert into the restApiCache', function(done) {
        var instance = {
          name: 'new',
          email: 'new@nuclear.com',
        }
        User.actions.save(instance).then(function() {
          var savedInstance = Flux.evaluateToJS(User.getters.byId(3))
          expect(savedInstance).to.deep.equal({
            id: 3,
            name: 'new',
            email: 'new@nuclear.com',
          })
          done()
        }).catch(done)
      })
    })
  })
})
