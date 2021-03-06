'use strict'

var fs = require('fs')
var path = require('path')
var test = require('tape')
var remark = require('remark')
var defsplit = require('..')

test('remark-defsplit', function (t) {
  t.equal(
    process(readInput('wonders/wonders')),
    readOutput('wonders/wonders'),
    'extracts destinations'
  )

  t.equal(
    process(readOutput('wonders/wonders')),
    readOutput('wonders/wonders'),
    'idempotence'
  )

  t.equal(
    process(readInput('clash/different-sections')),
    readOutput('clash/different-sections'),
    'extracted definitions in different sections do not clash'
  )

  t.equal(
    process(readInput('clash/other-definitions')),
    readOutput('clash/other-definitions'),
    'new-born definitions don’t clash with existing identifiers'
  )

  t.equal(
    process(readInput('clash/reuse')),
    readOutput('clash/reuse'),
    'identifier reuses existing identifiers'
  )

  t.equal(
    process(readInput('clash/reuse-title-mismatch')),
    readOutput('clash/reuse-title-mismatch'),
    'identifier reuses existing identifiers does not clash with titles'
  )

  t.equal(
    process(readInput('clash/object-prototype-props')),
    readOutput('clash/object-prototype-props'),
    'identifier doesn’t clash with Object.prototype property names'
  )

  t.equal(
    process(readInput('options/id-multi'), {id: ['travis-badge', 'travis']}),
    readOutput('options/id-multi'),
    '`options.id` works with array of values'
  )

  t.equal(
    process(readInput('options/id-single'), {id: 'travis-ci-0'}),
    readOutput('options/id-single'),
    '`options.id` works with a single value'
  )

  t.equal(
    process(readInput('options/object-prototype-props'), {
      id: ['__proto__', 'constructor']
    }),
    readOutput('options/object-prototype-props'),
    '`options.id` works with Object.prototype property names'
  )

  t.equal(
    process(readInput('local/example')),
    readOutput('local/example'),
    'should support links to local things'
  )

  t.end()
})

function process(src, options) {
  return remark().use(defsplit, options).processSync(src).toString()
}

function readInput(fp) {
  return fs.readFileSync(path.join(__dirname, 'data', fp + '.md'))
}

function readOutput(fp) {
  return remark()
    .processSync(readInput(fp + '-output'))
    .toString()
}
