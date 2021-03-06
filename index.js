'use strict'

var URL = require('url').URL
var path = require('path')
var Index = require('unist-util-index')

var concat = [].concat
var push = [].push

module.exports = defsplit

function defsplit(options) {
  var id = (options || {}).id || []
  var ids = (typeof id === 'object' && 'length' in id ? id : [id]).map(String)

  return transform

  function transform(tree) {
    var definitionsById = new Index(tree, 'definition', 'identifier')
    var definitionsByUrl = new Index(tree, 'definition', 'url')
    var definitions = []
    var hosts = Object.create(null)

    postorder(tree)

    push.apply(tree.children, definitions)

    function postorder(node) {
      var nodes

      if (node.children) {
        node.children = concat.apply([], node.children.map(postorder))
      }

      if (node.type === 'definition' || node.type === 'heading') {
        nodes = definitions.concat(node)
        definitions = []
        return nodes
      }

      if (node.type === 'link' || node.type === 'image') {
        node.type += 'Reference'
        node.referenceType = 'full'
        node.identifier = identifier(node.url, node.title)

        delete node.url
        delete node.title
      }

      return node
    }

    function identifier(link, title) {
      var identifier = null
      var found = definitionsByUrl.get(link).some(some)
      var host
      var definition

      if (found) {
        return identifier
      }

      identifier = ids.shift()

      if (!identifier) {
        host = urlHost(link)
        hosts[host] |= 0

        do {
          identifier = (host ? host + '-' : '') + ++hosts[host]
        } while (definitionsById.get(identifier).length)
      }

      definition = {
        type: 'definition',
        identifier: identifier,
        title: title,
        url: link
      }

      definitions.push(definition)
      definitionsById.add(definition)
      definitionsByUrl.add(definition)

      return identifier

      function some(def) {
        if (def.title === title) {
          identifier = def.identifier
          return true
        }

        return false
      }
    }
  }
}

function urlHost(link) {
  var host

  try {
    host = new URL(link).host
  } catch (_) {}

  return host ? path.parse(host).name : ''
}
