/*eslint-disable one-var, comma-dangle*/
import { Map, Set, is } from 'immutable'
import * as KeypathTracker from '../src/reactor/keypath-tracker'
import { toImmutable } from '../src/immutable-helpers'

const { status, Node } = KeypathTracker

describe('Keypath Tracker', () => {
  describe('unchanged', () => {
    it('should properly register ["foo"]', () => {
      const keypath = ['foo']
      const state = new Node()
      let tracker = KeypathTracker.unchanged(state, keypath)

      const expected = new Node({
        status: status.CLEAN,
        state: 1,
        children: toImmutable({
          foo: {
            status: status.CLEAN,
            state: 1,
            children: {},
          },
        })
      })
      expect(is(tracker, expected)).toBe(true)
    })

    it('should properly register ["foo", "bar"]', () => {
      const keypath = ['foo', 'bar']
      const state = new Node()
      let tracker = KeypathTracker.unchanged(state, keypath)

      const expected = new Node({
        status: status.CLEAN,
        state: 1,
        children: toImmutable({
          foo: {
            status: status.CLEAN,
            state: 1,
            children: {
              bar: {
                status: status.CLEAN,
                state: 1,
                children: {},
              },
            }
          },
        })
      })

      expect(is(tracker, expected)).toBe(true)
    })

    it('should register ["foo", "bar"] when ["foo"] is already registered', () => {
      const keypath = ['foo', 'bar']
      const origTracker = new Node({
        status: status.CLEAN,
        state: 1,
        children: toImmutable({
          foo: {
            status: status.UNKNOWN,
            state: 2,
            children: {},
          },
        })
      })
      const tracker = KeypathTracker.unchanged(origTracker, keypath)
      const expected = new Node({
        status: status.CLEAN,
        state: 1,
        children: toImmutable({
          foo: {
            status: status.UNKNOWN,
            state: 2,
            children: {
              bar: {
                status: status.CLEAN,
                state: 1,
                children: {},
              },
            }
          },
        })
      })

      expect(is(tracker, expected)).toBe(true)
    })

    it('should mark something as unchanged', () => {
      const keypath = ['foo', 'bar']
      const orig = new Node({
        status: status.CLEAN,
        state: 1,
        children: toImmutable({
          foo: {
            status: status.DIRTY,
            state: 2,
            children: {
              bar: {
                status: status.UNKNOWN,
                state: 1,
                children: {},
              },
            }
          },
        }),
      })
      const tracker = KeypathTracker.unchanged(orig, keypath)
      const expected = new Node({
        status: status.CLEAN,
        state: 1,
        children: toImmutable({
          foo: {
            status: status.DIRTY,
            state: 2,
            children: {
              bar: {
                status: status.CLEAN,
                state: 1,
                children: {},
              },
            }
          },
        }),
      })

      expect(is(tracker, expected)).toBe(true)
    })

    it('should mark the root node as unchanged', () => {
      const orig = new Node({
        status: status.UNKNOWN,
        state: 1,
        children: toImmutable({
          foo: {
            status: status.UNKNOWN,
            state: 2,
            children: {}
          },
        }),
      })
      const tracker = KeypathTracker.unchanged(orig, [])
      const expected = new Node({
        status: status.CLEAN,
        state: 1,
        children: toImmutable({
          foo: {
            status: status.CLEAN,
            state: 2,
            children: {},
          },
        }),
      })

      expect(is(tracker, expected)).toBe(true)
    })
  })


  describe('changed', () => {
    it('should initialize a node with a DIRTY status', () => {
      const orig = new Node({
        status: status.CLEAN,
        state: 1,
      })
      const result = KeypathTracker.changed(orig, ['foo'])
      const expected = new Node({
        status: status.DIRTY,
        state: 2,
        children: toImmutable({
          foo: {
            status: status.DIRTY,
            state: 1,
            children: {},
          },
        }),
      })

      expect(is(result, expected)).toBe(true)
    })
    it('should traverse and increment for parents and mark children clean', () => {
      const orig = new Node({
        status: status.CLEAN,
        state: 1,
          children: toImmutable({
          foo: {
            state: 1,
            children: {
              bar: {
                status: status.CLEAN,
                state: 1,
                children: {
                  baz: {
                    status: status.CLEAN,
                    state: 1,
                    children: {},
                  },
                  bat: {
                    status: status.CLEAN,
                    state: 1,
                    children: {},
                  },
                },
              },
            },
          },
        }),
      })
      const result = KeypathTracker.changed(orig, ['foo', 'bar'])
      const expected = new Node({
        status: status.DIRTY,
        state: 2,
          children: toImmutable({
          foo: {
            status: status.DIRTY,
            state: 2,
            children: {
              bar: {
                status: status.DIRTY,
                state: 2,
                children: {
                  baz: {
                    status: status.UNKNOWN,
                    state: 1,
                    children: {},
                  },
                  bat: {
                    status: status.UNKNOWN,
                    state: 1,
                    children: {},
                  },
                },
              },
            },
          },
        }),
      })

      expect(is(result, expected)).toBe(true)
    })

    it('should handle the root node', () => {
      const orig = new Node({
        status: status.CLEAN,
        state: 1,
          children: toImmutable({
          foo: {
            status: status.UNKNOWN,
            state: 1,
            children: {
              bar: {
                status: status.CLEAN,
                state: 1,
                children: {
                  baz: {
                    status: status.CLEAN,
                    state: 1,
                    children: {},
                  },
                  bat: {
                    status: status.CLEAN,
                    state: 1,
                    children: {},
                  },
                },
              },
            },
          },
        }),
      })
      const result = KeypathTracker.changed(orig, [])
      const expected = new Node({
        status: status.DIRTY,
        state: 2,
          children: toImmutable({
          foo: {
            status: status.UNKNOWN,
            state: 1,
            children: {
              bar: {
                status: status.UNKNOWN,
                state: 1,
                children: {
                  baz: {
                    status: status.UNKNOWN,
                    state: 1,
                    children: {},
                  },
                  bat: {
                    status: status.UNKNOWN,
                    state: 1,
                    children: {},
                  },
                },
              },
            },
          },
        }),
      })

      expect(is(result, expected)).toBe(true)
    })
  })

  describe('isEqual', () => {
    const state = new Node({
      state: 1,
      status: status.DIRTY,
      children: toImmutable({
        foo: {
          status: status.DIRTY,
          state: 2,
          children: {
            bar: {
              status: status.DIRTY,
              state: 2,
              children: {
                baz: {
                  status: status.UNKNOWN,
                  state: 1,
                  children: {},
                },
                bat: {
                  status: status.UNKNOWN,
                  state: 1,
                  children: {},
                },
              },
            },
          },
        },
      })
    })

    it('should return false for a mismatch on the root node', () => {
      const result = KeypathTracker.isEqual(state, [], 2)
      expect(result).toBe(false)
    })

    it('should return false with an invalid keypath', () => {
      const result = KeypathTracker.isEqual(state, ['foo', 'wat'], 2)
      expect(result).toBe(false)
    })

    it('should return false when values dont match', () => {
      const result = KeypathTracker.isEqual(state, ['foo', 'bar'], 1)
      expect(result).toBe(false)
    })

    it('should return false when node is unknown', () => {
      const result = KeypathTracker.isEqual(state, ['foo', 'bar', 'baz'], 1)
      expect(result).toBe(false)
    })

    it('should return true when values match and node is clean', () => {
      const result = KeypathTracker.isEqual(state, ['foo', 'bar'], 2)
      expect(result).toBe(true)
    })
  })

  describe('get', () => {
    const state = new Node({
      state: 1,
      status: status.DIRTY,
      children: toImmutable({
        foo: {
          status: status.DIRTY,
          state: 2,
          children: {
            bar: {
              status: status.DIRTY,
              state: 2,
              children: {
                baz: {
                  status: status.UNKNOWN,
                  state: 1,
                  children: {},
                },
                bat: {
                  status: status.UNKNOWN,
                  state: 1,
                  children: {},
                },
              },
            },
          },
        },
      })
    })

    it('should return undefined with an invalid keypath', () => {
      const result = KeypathTracker.get(state, ['foo', 'wat'])
      expect(result).toBe(undefined)
    })

    it('should return a value for a single depth', () => {
      const result = KeypathTracker.get(state, ['foo'])
      expect(result).toBe(2)
    })

    it('should return a value for a deeper keypath', () => {
      const result = KeypathTracker.get(state, ['foo', 'bar', 'baz'])
      expect(result).toBe(1)
    })
  })

  describe('isClean', () => {
    const state = new Node({
      state: 1,
      status: status.DIRTY,
      children: toImmutable({
        foo: {
          status: status.DIRTY,
          state: 2,
          children: {
            bar: {
              status: status.DIRTY,
              state: 2,
              children: {
                baz: {
                  status: status.UNKNOWN,
                  state: 1,
                  children: {},
                },
                bat: {
                  status: status.CLEAN,
                  state: 1,
                  children: {},
                },
              },
            },
          },
        },
      })
    })

    it('should return false with an invalid keypath', () => {
      const result = KeypathTracker.isClean(state, ['foo', 'wat'])
      expect(result).toBe(false)
    })

    it('should return false for a DIRTY value', () => {
      const result = KeypathTracker.isClean(state, ['foo'])
      expect(result).toBe(false)
    })

    it('should return false for an UNKNOWN value', () => {
      const result = KeypathTracker.isClean(state, ['foo', 'bar', 'baz'])
      expect(result).toBe(false)
    })

    it('should return true for an CLEAN value', () => {
      const result = KeypathTracker.isClean(state, ['foo', 'bar', 'bat'])
      expect(result).toBe(true)
    })
  })

  describe('incrementAndClean', () => {
    it('should work when the root node is clean', () => {
      const state = new Node({
        state: 2,
        status: status.CLEAN,
        chidlren: toImmutable({
          foo: {
            status: status.DIRTY,
            state: 2,
            children: {
              bar: {
                status: status.UNKNOWN,
                state: 1,
                children: {}
              },
            },
          },
        }),
      })

      const expected = new Node({
        state: 2,
        status: status.CLEAN,
        chidlren: toImmutable({
          foo: {
            status: status.CLEAN,
            state: 2,
            children: {
              bar: {
                status: status.CLEAN,
                state: 2,
                children: {}
              },
            },
          },
        }),
      })


      const result = KeypathTracker.incrementAndClean(state)
      expect(is(result, expected)).toBe(true)
    })
    it('should traverse the tree and increment any state value thats UNKNOWN and mark everything CLEAN', () => {
      const state = new Node({
        state: 2,
        status: status.DIRTY,
        chidlren: toImmutable({
          foo: {
            status: status.DIRTY,
            state: 2,
            children: {
              bar: {
                status: status.UNKNOWN,
                state: 1,
                children: {
                  baz: {
                    status: status.UNKNOWN,
                    state: 1,
                    children: {},
                  },
                  bat: {
                    status: status.DIRTY,
                    state: 2,
                    children: {},
                  },
                },
              },
            },
          },
          top: {
            status: status.CLEAN,
            state: 1,
            children: {},
          },
        }),
      })

      const expected = new Node({
        state: 2,
        status: status.CLEAN,
        chidlren: toImmutable({
          foo: {
            status: status.CLEAN,
            state: 2,
            children: {
              bar: {
                status: status.CLEAN,
                state: 2,
                children: {
                  baz: {
                    status: status.UNKNOWN,
                    state: 2,
                    children: {},
                  },
                  bat: {
                    status: status.CLEAN,
                    state: 2,
                    children: {},
                  },
                },
              },
            },
          },
          top: {
            status: status.CLEAN,
            state: 1,
            children: {},
          },
        }),
      })


      const result = KeypathTracker.incrementAndClean(state)
      expect(is(result, expected)).toBe(true)
    })
  })
})
/*eslint-enable one-var, comma-dangle*/

