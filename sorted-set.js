(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SortedSet = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
var AbstractSortedSet, ArrayStrategy, BinaryTreeStrategy, RedBlackTreeStrategy, SortedSet,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AbstractSortedSet = _dereq_('./SortedSet/AbstractSortedSet');

ArrayStrategy = _dereq_('./SortedSet/ArrayStrategy');

BinaryTreeStrategy = _dereq_('./SortedSet/BinaryTreeStrategy');

RedBlackTreeStrategy = _dereq_('./SortedSet/RedBlackTreeStrategy');

SortedSet = (function(superClass) {
  extend(SortedSet, superClass);

  function SortedSet(options) {
    options || (options = {});
    options.strategy || (options.strategy = RedBlackTreeStrategy);
    options.comparator || (options.comparator = function(a, b) {
      return (a || 0) - (b || 0);
    });
    options.insertionCollisionStrategy || (options.insertionCollisionStrategy = 'throw');
    options.removeNullStrategy || (options.removeNullStrategy = 'throw');
    SortedSet.__super__.constructor.call(this, options);
  }

  return SortedSet;

})(AbstractSortedSet);

SortedSet.ArrayStrategy = ArrayStrategy;

SortedSet.BinaryTreeStrategy = BinaryTreeStrategy;

SortedSet.RedBlackTreeStrategy = RedBlackTreeStrategy;

module.exports = SortedSet;


},{"./SortedSet/AbstractSortedSet":3,"./SortedSet/ArrayStrategy":4,"./SortedSet/BinaryTreeStrategy":6,"./SortedSet/RedBlackTreeStrategy":7}],2:[function(_dereq_,module,exports){
var AbstractBinaryTree, BinaryTreeIterator, binaryTreeTraverse;

BinaryTreeIterator = _dereq_('./BinaryTreeIterator');

binaryTreeTraverse = function(node, callback) {
  if (node !== null) {
    binaryTreeTraverse(node.left, callback);
    callback(node.value);
    binaryTreeTraverse(node.right, callback);
  }
  return void 0;
};

AbstractBinaryTree = (function() {
  function AbstractBinaryTree() {}

  AbstractBinaryTree.prototype.toArray = function() {
    var ret;
    ret = [];
    binaryTreeTraverse(this.root, function(value) {
      return ret.push(value);
    });
    return ret;
  };

  AbstractBinaryTree.prototype.clear = function() {
    return this.root = null;
  };

  AbstractBinaryTree.prototype.forEachImpl = function(callback, sortedSet, thisArg) {
    var i;
    i = 0;
    binaryTreeTraverse(this.root, function(value) {
      callback.call(thisArg, value, i, sortedSet);
      return i += 1;
    });
    return void 0;
  };

  AbstractBinaryTree.prototype.contains = function(value) {
    var cmp, comparator, node;
    comparator = this.comparator;
    node = this.root;
    while (node !== null) {
      cmp = comparator(value, node.value);
      if (cmp === 0) {
        break;
      } else if (cmp < 0) {
        node = node.left;
      } else {
        node = node.right;
      }
    }
    return node !== null && node.value === value;
  };

  AbstractBinaryTree.prototype.findIterator = function(value) {
    return BinaryTreeIterator.find(this, value, this.comparator);
  };

  AbstractBinaryTree.prototype.beginIterator = function() {
    return BinaryTreeIterator.left(this);
  };

  AbstractBinaryTree.prototype.endIterator = function() {
    return BinaryTreeIterator.right(this);
  };

  return AbstractBinaryTree;

})();

module.exports = AbstractBinaryTree;


},{"./BinaryTreeIterator":5}],3:[function(_dereq_,module,exports){
var AbstractSortedSet;

module.exports = AbstractSortedSet = (function() {
  function AbstractSortedSet(options) {
    if ((options != null ? options.strategy : void 0) == null) {
      throw 'Must pass options.strategy, a strategy';
    }
    if ((options != null ? options.comparator : void 0) == null) {
      throw 'Must pass options.comparator, a comparator';
    }
    this.priv = new options.strategy(options);
    this.length = 0;
  }

  AbstractSortedSet.prototype.insert = function(value) {
    if (this.priv.insert(value) != null) {
      this.length += 1;
    }
    return this;
  };

  AbstractSortedSet.prototype.remove = function(value) {
    if (this.priv.remove(value) != null) {
      this.length -= 1;
    }
    return this;
  };

  AbstractSortedSet.prototype.clear = function() {
    this.priv.clear();
    this.length = 0;
    return this;
  };

  AbstractSortedSet.prototype.contains = function(value) {
    return this.priv.contains(value);
  };

  AbstractSortedSet.prototype.toArray = function() {
    return this.priv.toArray();
  };

  AbstractSortedSet.prototype.forEach = function(callback, thisArg) {
    this.priv.forEachImpl(callback, this, thisArg);
    return this;
  };

  AbstractSortedSet.prototype.map = function(callback, thisArg) {
    var ret;
    ret = [];
    this.forEach(function(value, index, self) {
      return ret.push(callback.call(thisArg, value, index, self));
    });
    return ret;
  };

  AbstractSortedSet.prototype.filter = function(callback, thisArg) {
    var ret;
    ret = [];
    this.forEach(function(value, index, self) {
      if (callback.call(thisArg, value, index, self)) {
        return ret.push(value);
      }
    });
    return ret;
  };

  AbstractSortedSet.prototype.every = function(callback, thisArg) {
    var ret;
    ret = true;
    this.forEach(function(value, index, self) {
      if (ret && !callback.call(thisArg, value, index, self)) {
        return ret = false;
      }
    });
    return ret;
  };

  AbstractSortedSet.prototype.some = function(callback, thisArg) {
    var ret;
    ret = false;
    this.forEach(function(value, index, self) {
      if (!ret && callback.call(thisArg, value, index, self)) {
        return ret = true;
      }
    });
    return ret;
  };

  AbstractSortedSet.prototype.findIterator = function(value) {
    return this.priv.findIterator(value);
  };

  AbstractSortedSet.prototype.beginIterator = function() {
    return this.priv.beginIterator();
  };

  AbstractSortedSet.prototype.endIterator = function() {
    return this.priv.endIterator();
  };

  return AbstractSortedSet;

})();


},{}],4:[function(_dereq_,module,exports){
var ArrayStrategy, Iterator, binarySearchForIndex;

Iterator = (function() {
  function Iterator(priv, index1) {
    this.priv = priv;
    this.index = index1;
    this.data = this.priv.data;
  }

  Iterator.prototype.hasNext = function() {
    return this.index < this.data.length;
  };

  Iterator.prototype.hasPrevious = function() {
    return this.index > 0;
  };

  Iterator.prototype.value = function() {
    if (this.index < this.data.length) {
      return this.data[this.index];
    } else {
      return null;
    }
  };

  Iterator.prototype.setValue = function(value) {
    if (!this.priv.options.allowSetValue) {
      throw 'Must set options.allowSetValue';
    }
    if (!this.hasNext()) {
      throw 'Cannot set value at end of set';
    }
    return this.data[this.index] = value;
  };

  Iterator.prototype.next = function() {
    if (this.index >= this.data.length) {
      return null;
    } else {
      return new Iterator(this.priv, this.index + 1);
    }
  };

  Iterator.prototype.previous = function() {
    if (this.index <= 0) {
      return null;
    } else {
      return new Iterator(this.priv, this.index - 1);
    }
  };

  return Iterator;

})();

binarySearchForIndex = function(array, value, comparator) {
  var high, low, mid;
  low = 0;
  high = array.length;
  while (low < high) {
    mid = (low + high) >>> 1;
    if (comparator(array[mid], value) < 0) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
};

ArrayStrategy = (function() {
  function ArrayStrategy(options) {
    this.options = options;
    this.comparator = this.options.comparator;
    this.data = [];
    if (this.options.insertionCollisionStrategy === 'replace') {
      this.insertionCollion = function(value, index) {
        this.data[index] = value;
        return null;
      };
    } else if (this.options.insertionCollisionStrategy === 'ignore') {
      this.insertionCollion = function() {
        return null;
      };
    } else {
      this.insertionCollion = function() {
        throw 'Value already in set';
      };
    }
    if (this.options.removeNullStrategy === 'ignore') {
      this.removeNull = function() {};
    } else {
      this.removeNull = function() {
        throw 'Value not in set';
      };
    }
  }

  ArrayStrategy.prototype.toArray = function() {
    return this.data;
  };

  ArrayStrategy.prototype.insert = function(value) {
    var index;
    index = binarySearchForIndex(this.data, value, this.comparator);
    if (index < this.data.length && this.comparator(this.data[index], value) === 0) {
      return this.insertionCollion(value, index);
    }
    this.data.splice(index, 0, value);
    return true;
  };

  ArrayStrategy.prototype.remove = function(value) {
    var index;
    index = binarySearchForIndex(this.data, value, this.comparator);
    if (index >= this.data.length || value !== this.data[index]) {
      return this.removeNull();
    } else {
      return this.data.splice(index, 1);
    }
  };

  ArrayStrategy.prototype.clear = function() {
    return this.data.length = 0;
  };

  ArrayStrategy.prototype.contains = function(value) {
    var index;
    index = binarySearchForIndex(this.data, value, this.comparator);
    return this.index !== this.data.length && this.data[index] === value;
  };

  ArrayStrategy.prototype.forEachImpl = function(callback, sortedSet, thisArg) {
    var i, index, len, ref, value;
    ref = this.data;
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      value = ref[index];
      callback.call(thisArg, value, index, sortedSet);
    }
    return void 0;
  };

  ArrayStrategy.prototype.findIterator = function(value) {
    var index;
    index = binarySearchForIndex(this.data, value, this.comparator);
    return new Iterator(this, index);
  };

  ArrayStrategy.prototype.beginIterator = function() {
    return new Iterator(this, 0);
  };

  ArrayStrategy.prototype.endIterator = function() {
    return new Iterator(this, this.data.length);
  };

  return ArrayStrategy;

})();

module.exports = ArrayStrategy;


},{}],5:[function(_dereq_,module,exports){
var BinaryTreeIterator, descendAllTheWay, moveCursor;

descendAllTheWay = function(leftOrRight, node) {
  var parent;
  while (node[leftOrRight] !== null) {
    parent = node;
    node = node[leftOrRight];
    node._iteratorParentNode = parent;
  }
  return node;
};

moveCursor = function(leftOrRight, node) {
  var parent, rightOrLeft;
  if (node[leftOrRight] !== null) {
    parent = node;
    node = node[leftOrRight];
    node._iteratorParentNode = parent;
    rightOrLeft = leftOrRight === 'left' ? 'right' : 'left';
    node = descendAllTheWay(rightOrLeft, node);
  } else {
    while ((parent = node._iteratorParentNode) !== null && parent[leftOrRight] === node) {
      node = parent;
    }
    node = parent;
  }
  return node;
};

BinaryTreeIterator = (function() {
  function BinaryTreeIterator(tree1, node1) {
    this.tree = tree1;
    this.node = node1;
  }

  BinaryTreeIterator.prototype.next = function() {
    var node;
    if (this.node === null) {
      return null;
    } else {
      node = moveCursor('right', this.node);
      return new BinaryTreeIterator(this.tree, node);
    }
  };

  BinaryTreeIterator.prototype.previous = function() {
    var node;
    if (this.node === null) {
      if (this.tree.root === null) {
        return null;
      } else {
        this.tree.root._iteratorParentNode = null;
        node = descendAllTheWay('right', this.tree.root);
        return new BinaryTreeIterator(this.tree, node);
      }
    } else {
      node = moveCursor('left', this.node);
      if (node === null) {
        return null;
      } else {
        return new BinaryTreeIterator(this.tree, node);
      }
    }
  };

  BinaryTreeIterator.prototype.hasNext = function() {
    return this.node !== null;
  };

  BinaryTreeIterator.prototype.hasPrevious = function() {
    return this.previous() !== null;
  };

  BinaryTreeIterator.prototype.value = function() {
    if (this.node === null) {
      return null;
    } else {
      return this.node.value;
    }
  };

  BinaryTreeIterator.prototype.setValue = function(value) {
    if (!this.tree.options.allowSetValue) {
      throw 'Must set options.allowSetValue';
    }
    if (!this.hasNext()) {
      throw 'Cannot set value at end of set';
    }
    return this.node.value = value;
  };

  return BinaryTreeIterator;

})();

BinaryTreeIterator.find = function(tree, value, comparator) {
  var cmp, nextNode, node, root;
  root = tree.root;
  if (root != null) {
    root._iteratorParentNode = null;
  }
  node = root;
  nextNode = null;
  while (node !== null) {
    cmp = comparator(value, node.value);
    if (cmp === 0) {
      break;
    } else if (cmp < 0) {
      if (node.left === null) {
        break;
      }
      nextNode = node;
      node.left._iteratorParentNode = node;
      node = node.left;
    } else {
      if (node.right !== null) {
        node.right._iteratorParentNode = node;
        node = node.right;
      } else {
        node = nextNode;
        break;
      }
    }
  }
  return new BinaryTreeIterator(tree, node);
};

BinaryTreeIterator.left = function(tree) {
  var node;
  if (tree.root === null) {
    return new BinaryTreeIterator(tree, null);
  } else {
    tree.root._iteratorParentNode = null;
    node = descendAllTheWay('left', tree.root);
    return new BinaryTreeIterator(tree, node);
  }
};

BinaryTreeIterator.right = function(tree) {
  return new BinaryTreeIterator(tree, null);
};

module.exports = BinaryTreeIterator;


},{}],6:[function(_dereq_,module,exports){
var AbstractBinaryTreeStrategy, BinaryTreeStrategy, Node, binaryTreeDelete, nodeAllTheWay,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AbstractBinaryTreeStrategy = _dereq_('./AbstractBinaryTreeStrategy');

Node = (function() {
  function Node(value1) {
    this.value = value1;
    this.left = null;
    this.right = null;
  }

  return Node;

})();

nodeAllTheWay = function(node, leftOrRight) {
  while (node[leftOrRight] !== null) {
    node = node[leftOrRight];
  }
  return node;
};

binaryTreeDelete = function(node, value, comparator, handleRemoveNull) {
  var cmp, nextNode;
  if (node === null) {
    handleRemoveNull();
    return null;
  }
  cmp = comparator(value, node.value);
  if (cmp < 0) {
    node.left = binaryTreeDelete(node.left, value, comparator);
  } else if (cmp > 0) {
    node.right = binaryTreeDelete(node.right, value, comparator);
  } else {
    if (node.value !== value) {
      handleRemoveNull();
      return node;
    }
    if (node.left === null && node.right === null) {
      node = null;
    } else if (node.right === null) {
      node = node.left;
    } else if (node.left === null) {
      node = node.right;
    } else {
      nextNode = nodeAllTheWay(node.right, 'left');
      node.value = nextNode.value;
      node.right = binaryTreeDelete(node.right, nextNode.value, comparator);
    }
  }
  return node;
};

BinaryTreeStrategy = (function(superClass) {
  extend(BinaryTreeStrategy, superClass);

  function BinaryTreeStrategy(options) {
    this.options = options;
    this.comparator = this.options.comparator;
    this.root = null;
    if (this.options.insertionCollisionStrategy === 'replace') {
      this.insertionCollision = function(node, value) {
        node.value = value;
        return null;
      };
    } else if (this.options.insertionCollisionStrategy === 'ignore') {
      this.insertionCollision = function() {
        return null;
      };
    } else {
      this.insertionCollision = function() {
        throw 'Value already in set';
      };
    }
    if (this.options.removeNullStrategy === 'ignore') {
      this.removeNull = (function(_this) {
        return function() {
          return _this.successfulRemoval = null;
        };
      })(this);
    } else {
      this.removeNull = function() {
        throw 'Value not in set';
      };
    }
  }

  BinaryTreeStrategy.prototype.insert = function(value) {
    var cmp, compare, leftOrRight, parent;
    compare = this.comparator;
    if (this.root != null) {
      parent = this.root;
      while (true) {
        cmp = compare(value, parent.value);
        if (cmp === 0) {
          return this.insertionCollision(parent, value);
        }
        leftOrRight = cmp < 0 ? 'left' : 'right';
        if (parent[leftOrRight] === null) {
          break;
        }
        parent = parent[leftOrRight];
      }
      parent[leftOrRight] = new Node(value);
    } else {
      this.root = new Node(value);
    }
    return true;
  };

  BinaryTreeStrategy.prototype.remove = function(value) {
    this.successfulRemoval = true;
    this.root = binaryTreeDelete(this.root, value, this.comparator, this.removeNull);
    return this.successfulRemoval;
  };

  return BinaryTreeStrategy;

})(AbstractBinaryTreeStrategy);

module.exports = BinaryTreeStrategy;


},{"./AbstractBinaryTreeStrategy":2}],7:[function(_dereq_,module,exports){
var AbstractBinaryTreeStrategy, Node, RedBlackTreeStrategy, colorFlip, findMinNode, fixUp, insertInNode, moveRedLeft, moveRedRight, removeFromNode, removeMinNode, rotateLeft, rotateRight,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AbstractBinaryTreeStrategy = _dereq_('./AbstractBinaryTreeStrategy');

Node = (function() {
  function Node(value1) {
    this.value = value1;
    this.left = null;
    this.right = null;
    this.isRed = true;
  }

  return Node;

})();

rotateLeft = function(h) {
  var x;
  x = h.right;
  h.right = x.left;
  x.left = h;
  x.isRed = h.isRed;
  h.isRed = true;
  return x;
};

rotateRight = function(h) {
  var x;
  x = h.left;
  h.left = x.right;
  x.right = h;
  x.isRed = h.isRed;
  h.isRed = true;
  return x;
};

colorFlip = function(h) {
  h.isRed = !h.isRed;
  h.left.isRed = !h.left.isRed;
  h.right.isRed = !h.right.isRed;
  return void 0;
};

moveRedLeft = function(h) {
  colorFlip(h);
  if (h.right !== null && h.right.left !== null && h.right.left.isRed) {
    h.right = rotateRight(h.right);
    h = rotateLeft(h);
    colorFlip(h);
  }
  return h;
};

moveRedRight = function(h) {
  colorFlip(h);
  if (h.left !== null && h.left.left !== null && h.left.left.isRed) {
    h = rotateRight(h);
    colorFlip(h);
  }
  return h;
};

insertInNode = function(h, value, compare, insertionCollision) {
  if (h === null) {
    return new Node(value);
  }
  if (compare(h.value, value) === 0) {
    return insertionCollision(h, value);
  } else {
    if (compare(value, h.value) < 0) {
      h.left = insertInNode(h.left, value, compare, insertionCollision);
    } else {
      h.right = insertInNode(h.right, value, compare, insertionCollision);
    }
  }
  if (h.right !== null && h.right.isRed && !(h.left !== null && h.left.isRed)) {
    h = rotateLeft(h);
  }
  if (h.left !== null && h.left.isRed && h.left.left !== null && h.left.left.isRed) {
    h = rotateRight(h);
  }
  if (h.left !== null && h.left.isRed && h.right !== null && h.right.isRed) {
    colorFlip(h);
  }
  return h;
};

findMinNode = function(h) {
  while (h.left !== null) {
    h = h.left;
  }
  return h;
};

fixUp = function(h) {
  if (h.right !== null && h.right.isRed) {
    h = rotateLeft(h);
  }
  if (h.left !== null && h.left.isRed && h.left.left !== null && h.left.left.isRed) {
    h = rotateRight(h);
  }
  if (h.left !== null && h.left.isRed && h.right !== null && h.right.isRed) {
    colorFlip(h);
  }
  return h;
};

removeMinNode = function(h) {
  if (h.left === null) {
    return null;
  }
  if (!h.left.isRed && !(h.left.left !== null && h.left.left.isRed)) {
    h = moveRedLeft(h);
  }
  h.left = removeMinNode(h.left);
  return fixUp(h);
};

removeFromNode = function(h, value, compare, removalFailure) {
  if (h === null) {
    removalFailure();
    return null;
  }
  if (h.value !== value && compare(value, h.value) < 0) {
    if (h.left === null) {
      removalFailure();
      return h;
    }
    if (!h.left.isRed && !(h.left.left !== null && h.left.left.isRed)) {
      h = moveRedLeft(h);
    }
    h.left = removeFromNode(h.left, value, compare, removalFailure);
  } else {
    if (h.left !== null && h.left.isRed) {
      h = rotateRight(h);
    }
    if (h.right === null) {
      if (value === h.value) {
        return null;
      } else {
        removalFailure();
        return h;
      }
    }
    if (!h.right.isRed && !(h.right.left !== null && h.right.left.isRed)) {
      h = moveRedRight(h);
    }
    if (value === h.value) {
      h.value = findMinNode(h.right).value;
      h.right = removeMinNode(h.right);
    } else {
      h.right = removeFromNode(h.right, value, compare, removalFailure);
    }
  }
  if (h !== null) {
    h = fixUp(h);
  }
  return h;
};

module.exports = RedBlackTreeStrategy = (function(superClass) {
  extend(RedBlackTreeStrategy, superClass);

  function RedBlackTreeStrategy(options) {
    this.options = options;
    this.comparator = this.options.comparator;
    this.root = null;
    if (this.options.insertionCollisionStrategy === 'replace') {
      this.insertionCollision = (function(_this) {
        return function(node, value) {
          _this.successfulInsertion = null;
          node.value = value;
          return node;
        };
      })(this);
    } else if (this.options.insertionCollisionStrategy === 'ignore') {
      this.insertionCollision = (function(_this) {
        return function(node) {
          _this.successfulInsertion = null;
          return node;
        };
      })(this);
    } else {
      this.insertionCollision = function() {
        throw 'Value already in set';
      };
    }
    if (this.options.removeNullStrategy === 'ignore') {
      this.removeNull = (function(_this) {
        return function() {
          _this.successfulRemoval = null;
          return null;
        };
      })(this);
    } else {
      this.removeNull = function() {
        throw 'Value not in set';
      };
    }
  }

  RedBlackTreeStrategy.prototype.insert = function(value) {
    this.successfulInsertion = true;
    this.root = insertInNode(this.root, value, this.comparator, this.insertionCollision);
    this.root.isRed = false;
    return this.successfulInsertion;
  };

  RedBlackTreeStrategy.prototype.remove = function(value) {
    this.successfulRemoval = true;
    this.root = removeFromNode(this.root, value, this.comparator, this.removeNull);
    if (this.root !== null) {
      this.root.isRed = false;
    }
    return this.successfulRemoval;
  };

  return RedBlackTreeStrategy;

})(AbstractBinaryTreeStrategy);


},{"./AbstractBinaryTreeStrategy":2}]},{},[1])(1)
});
