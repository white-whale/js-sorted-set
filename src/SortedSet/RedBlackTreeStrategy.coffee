AbstractBinaryTreeStrategy = require('./AbstractBinaryTreeStrategy')

# An implementation of Left-Leaning Red-Black trees.
#
# It's copied from http://www.cs.princeton.edu/~rs/talks/LLRB/LLRB.pdf.
# It's practically a copy-paste job, minus the semicolons. missing bits were
# filled in with hints from
# http://www.teachsolaisgames.com/articles/balanced_left_leaning.html
#
# Here are some differences:
# * This isn't a map structure: it's just a tree. There are no keys: the
#   comparator applies to the values.
# * We use the passed comparator.

class Node
  constructor: (@value) ->
    @left = null
    @right = null
    @isRed = true # null nodes -- leaves -- are black

rotateLeft = (h) ->
  x = h.right
  h.right = x.left
  x.left = h
  x.isRed = h.isRed
  h.isRed = true
  x

rotateRight = (h) ->
  x = h.left
  h.left = x.right
  x.right = h
  x.isRed = h.isRed
  h.isRed = true
  x

colorFlip = (h) ->
  h.isRed = !h.isRed
  h.left.isRed = !h.left.isRed
  h.right.isRed = !h.right.isRed
  undefined

moveRedLeft = (h) ->
  #throw 'Preconditions failed' if !(!h.left.isRed && !h.left.left?.isRed)
  colorFlip(h)
  if h.right isnt null && h.right.left isnt null && h.right.left.isRed
    h.right = rotateRight(h.right)
    h = rotateLeft(h)
    colorFlip(h)
  h

moveRedRight = (h) ->
  #throw 'Preconditions failed' if !(!h.right.isRed && !h.right.left?.isRed)
  colorFlip(h)
  if h.left isnt null && h.left.left isnt null && h.left.left.isRed
    h = rotateRight(h)
    colorFlip(h)
  h

insertInNode = (h, value, compare, insertionCollision) ->
  if h is null
    return new Node(value)

  #if h.left isnt null && h.left.isRed && h.right isnt null && h.right.isRed
  #  colorFlip(h)

  if compare(h.value, value) == 0
    return insertionCollision(h, value);
  else
    if compare(value, h.value) < 0
      h.left = insertInNode(h.left, value, compare, insertionCollision)
    else
      h.right = insertInNode(h.right, value, compare, insertionCollision)

  if h.right isnt null && h.right.isRed && !(h.left isnt null && h.left.isRed)
    h = rotateLeft(h)

  if h.left isnt null && h.left.isRed && h.left.left isnt null && h.left.left.isRed
    h = rotateRight(h)

  # Put this here -- I couldn't get the whole thing to work otherwise :(
  if h.left isnt null && h.left.isRed && h.right isnt null && h.right.isRed
    colorFlip(h)

  h

findMinNode = (h) ->
  while h.left isnt null
    h = h.left
  h

fixUp = (h) ->
  # Fix right-leaning red nodes
  if h.right isnt null && h.right.isRed
    h = rotateLeft(h)

  # Handle a 4-node that traverses down the left
  if h.left isnt null && h.left.isRed && h.left.left isnt null && h.left.left.isRed
    h = rotateRight(h)

  # split 4-nodes
  if h.left isnt null && h.left.isRed && h.right isnt null && h.right.isRed
    colorFlip(h)

  h

removeMinNode = (h) ->
  if h.left is null
    return null

  if !h.left.isRed && !(h.left.left isnt null && h.left.left.isRed)
    h = moveRedLeft(h)

  h.left = removeMinNode(h.left)

  fixUp(h)

removeFromNode = (h, value, compare, removalFailure) ->
  if h is null
    removalFailure()
    return null

  if h.value isnt value && compare(value, h.value) < 0
    if h.left is null
      removalFailure()
      return h
    if !h.left.isRed && !(h.left.left isnt null && h.left.left.isRed)
      h = moveRedLeft(h)
    h.left = removeFromNode(h.left, value, compare, removalFailure)
  else
    if h.left isnt null && h.left.isRed
      h = rotateRight(h)

    if h.right is null
      if value is h.value
        return null # leaf node; LLRB assures no left value here
      else
        removalFailure()
        return h

    if !h.right.isRed && !(h.right.left isnt null && h.right.left.isRed)
      h = moveRedRight(h)
    if value is h.value
      h.value = findMinNode(h.right).value
      h.right = removeMinNode(h.right)
    else
      h.right = removeFromNode(h.right, value, compare, removalFailure)

  h = fixUp(h) if h isnt null

  h


module.exports = class RedBlackTreeStrategy extends AbstractBinaryTreeStrategy
  constructor: (@options) ->
    @comparator = @options.comparator
    @root = null
    if @options.insertionCollisionStrategy == 'replace'
      @insertionCollision = (node, value) =>
        @successfulInsertion = null
        node.value = value
        node
    else if @options.insertionCollisionStrategy == 'ignore'
      @insertionCollision = (node) =>
        @successfulInsertion = null
        node
    else
      @insertionCollision = -> throw 'Value already in set'

    if @options.removeNullStrategy == 'ignore'
      @removeNull = =>
        @successfulRemoval = null
        null
    else
      @removeNull = -> throw 'Value not in set'

  insert: (value) ->
    @successfulInsertion = true
    @root = insertInNode(@root, value, @comparator, @insertionCollision)
    @root.isRed = false # always
    @successfulInsertion

  remove: (value) ->
    @successfulRemoval = true
    @root = removeFromNode(@root, value, @comparator, @removeNull)
    @root.isRed = false if @root isnt null
    @successfulRemoval
