#!/usr/bin/env coffee

fs = require 'fs'

class MDLASCIIParser
  {@parser} = require './mdl-ascii-parser'

  @parse: (buffer) ->
    mdlFile = @parser.parse(buffer.toString().toLowerCase())
    for geometry in mdlFile.geometries
      children = {}
      for node in geometry.nodes
        children[node.parent] ?= []
        children[node.parent].push(node)

        if node.parent == 'null'
          geometry.rootNode = node

      for node in geometry.nodes
        if node.name of children
          node.children = children[node.name]
        else
          node.children = []

      geometry.nodes = null

    return mdlFile

module.exports =
  MDLASCIIParser: MDLASCIIParser

MDLASCIIParser.parse(fs.readFileSync('/tmp/atom-115115-26105-19y5tg5/chitin.key/data/demo_models_01.bif/c_falcon.mdl'))
