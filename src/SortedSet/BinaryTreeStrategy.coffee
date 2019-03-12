AbstractBinaryTreeStrategy = require('./AbstractBinaryTreeStrategy')

class Node
  constructor: (@value) ->
    @left = null
    @right = null

nodeAllTheWay = (node, leftOrRight) ->
  while node[leftOrRight] isnt null
    node = node[leftOrRight]
  node

# Returns the subtree, minus value
binaryTreeDelete = (node, value, comparator, handleRemoveNull) ->
  if node is null
    handleRemoveNull()
    return null;

  cmp = comparator(value, node.value)
  if cmp < 0
    node.left = binaryTreeDelete(node.left, value, comparator)
  else if cmp > 0
    node.right = binaryTreeDelete(node.right, value, comparator)
  else # This is the value we want to remove
    if node.value != value
      handleRemoveNull()
      return node
    if node.left is null && node.right is null
      node = null
    else if node.right is null
      node = node.left
    else if node.left is null
      node = node.right
    else
      nextNode = nodeAllTheWay(node.right, 'left')
      node.value = nextNode.value
      node.right = binaryTreeDelete(node.right, nextNode.value, comparator)

  node

class BinaryTreeStrategy extends AbstractBinaryTreeStrategy
  constructor: (@options) ->
    @comparator = @options.comparator
    @root = null
    if @options.insertionCollisionStrategy == 'replace'
      @insertionCollision = (node, value) ->
        node.value = value
        return null
    else if @options.insertionCollisionStrategy == 'ignore'
      @insertionCollision = -> null
    else
      @insertionCollision = -> throw 'Value already in set'

    if @options.removeNullStrategy == 'ignore'
      @removeNull = => @successfulRemoval = null
    else
      @removeNull = -> throw 'Value not in set'


  insert: (value) ->
    compare = @comparator
    if @root?
      parent = @root
      loop
        cmp = compare(value, parent.value)
        return @insertionCollision(parent, value) if cmp == 0
        leftOrRight = if cmp < 0 then 'left' else 'right'
        break if parent[leftOrRight] == null
        parent = parent[leftOrRight]
      parent[leftOrRight] = new Node(value)
    else
      @root = new Node(value)
    true

  remove: (value) ->
    @successfulRemoval = true
    @root = binaryTreeDelete(@root, value, @comparator, @removeNull)
    @successfulRemoval

module.exports = BinaryTreeStrategy
