/**
 * KeyPath Tracker
 *
 * St
 * {
 *   entityCache: {
 *     status: 'CLEAN',
 *     k
 *
 */
import { Map, Record } from 'immutable'
import { toImmutable, toJS } from '../immutable-helpers'

export const status = {
  CLEAN: 0,
  DIRTY: 1,
  UNKNOWN: 2,
}

export const Node = Record({
  status: status.CLEAN,
  state: 1,
  children: Map(),
})

export function unchanged(map, keypath) {
  const childKeypath = getChildKeypath(keypath)
  if (!map.hasIn(childKeypath)) {
    return map.update('children', children => recursiveRegister(children, keypath))
  }

  return map.updateIn(childKeypath, entry => {
    return entry
      .set('status', status.CLEAN)
      .update('children', children => recursiveSetStatus(children, status.CLEAN))
  })
}

export function changed(map, keypath) {
  const childrenKeypath = getChildKeypath(keypath).concat('children')
  return map
    .update('children', children => recursiveIncrement(children, keypath))
    // handle the root node
    .update('state', val => val + 1)
    .set('status', status.DIRTY)
    .updateIn(childrenKeypath, entry => recursiveSetStatus(entry, status.UNKNOWN))
}

/**
 * @param {Immutable.Map} map
 * @param {Keypath} keypath
 * @return {Status}
 */
export function isEqual(map, keypath, value) {
  const entry = map.getIn(getChildKeypath(keypath))

  if (!entry) {
    return false;
  }
  if (entry.get('status') === status.UNKNOWN) {
    return false
  }
  return entry.get('state') === value;
}

/**
 * Increments all unknown states and sets everything to CLEAN
 * @param {Immutable.Map} map
 * @return {Status}
 */
export function incrementAndClean(map) {
  if (map.size === 0) {
    return map
  }

  const rootStatus = map.get('status')
  if (rootStatus === status.DIRTY) {
    map = setClean(map)
  } else if (rootStatus === status.UNKNOWN) {
    map = setClean(increment(map))
  }
  return map
    .update('children', c => c.withMutations(m => {
      m.keySeq().forEach(key => {
        m.update(key, incrementAndClean)
      })
    }))
}

export function get(map, keypath) {
  return map.getIn(getChildKeypath(keypath).concat('state'))
}

export function isClean(map, keypath) {
  return map.getIn(getChildKeypath(keypath).concat('status')) === status.CLEAN
}

function increment(node) {
  return node.update('state', val => val + 1)
}

function setClean(node) {
  return node.set('status', status.CLEAN)
}

function setDirty(node) {
  return node.set('status', status.DIRTY)
}

function recursiveIncrement(map, keypath) {
  keypath = toImmutable(keypath)
  if (keypath.size === 0) {
    return map
  }

  return map.withMutations(map => {
    const key = keypath.first()
    const entry = map.get(key)

    if (!entry) {
      map.set(key, new Node({
        status: status.DIRTY,
      }))
    } else {
      map.update(key, node => setDirty(increment(node)))
    }

    map.updateIn([key, 'children'], children => recursiveIncrement(children, keypath.rest()))
  })
}

function recursiveRegister(map, keypath) {
  keypath = toImmutable(keypath)
  if (keypath.size === 0) {
    return map
  }

  return map.withMutations(map => {
    const key = keypath.first()
    const entry = map.get(key)

    if (!entry) {
      map.set(key, new Node())
    }
    map.updateIn([key, 'children'], children => recursiveRegister(children, keypath.rest()))
  })
}

/**
 * Turns ['foo', 'bar', 'baz'] -> ['foo', 'children', 'bar', 'children', 'baz']
 * @param {Keypath} keypath
 * @return {Keypath}
 */
function getChildKeypath(keypath) {
  // TODO(jordan): handle toJS more elegantly
  keypath = toJS(keypath)
  let ret = []
  for (var i = 0; i < keypath.length; i++) {
    ret.push('children')
    ret.push(keypath[i])
  }
  return ret
}

function recursiveSetStatus(map, status) {
  if (map.size === 0) {
    return map
  }

  return map.withMutations(map => {
    map.keySeq().forEach(key => {
      return map.update(key, entry => {
        return entry
          .update('children', children => recursiveSetStatus(children, status))
          .set('status', status)
      })
    })
  })
}
