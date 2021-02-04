//===============================Node============================
var Node = function(is_leaf, is_root) {
  var self = this;
  self.is_leaf = is_leaf;//是否为叶子节点
  self.is_root = is_root;//是否为根节点
  self.parent = null;//父节点
  self.prev = null;//叶节点的前节点
  self.next = null;//叶节点的后节点
  self.entries = []//关键字
  self.init();
}

Node.prototype.init = function() {
  var self = this;
  if(!self.leaf) {
    self.children = [];
  }
}

Node.prototype.get = function(key) {
  var self = this;
  
  if(self.is_leaf) { //如果是叶子节点 
    var low = 0, high = self.entries.length - 1, mid, comp;
    while(low <= high) {
      mid = Math.floor((low + high) / 2);
      comp = self.entries[mid].key - key;
      if(comp === 0) {
        return self.entries[mid].val;
      } else if(comp < 0) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return null;

  } else { //如果不是叶子节点

    if(key <= self.entries[0].key) { //如果key小于等于节点最左边的key，沿第一个子节点继续搜索 
      return self.children[0].get(key)
    } else if( key >= self.entries[self.entries.length - 1].key) {//如果key大于节点最右边的key，沿最后一个子节点继续搜索 
      return self.children[self.children.length - 1].get(key)
    } else {//否则沿比key大的前一个子节点继续搜索 
      for(var i = 0; i < self.entries.length; i++) {
        if(key <= self.entries[i].key){
          return self.children[i].get(key)
        }
      }
    } 
    return null;
  }
}

Node.prototype.remove = function(key, tree) {
  var self = this;
  if(self.is_leaf) {
    if(!self.contains(key)) {//如果不包含该关键字，则直接返回 
      return;
    }
    if(self.is_root) {//如果既是叶子节点又是跟节点，直接删除 
      self.remove_op(key)
      return;
    }
    if(self.entries.length > (Math.floor(tree.order/ 2)) && self.entries.length > 2) {
      self.remove_op(key)
    } else {//借位
      if(self.prev && self.prev.entries.length > Math.floor(tree.order/ 2) && self.prev.entries.length > 2 && self.prev.parent === self.parent) {//如果自身关键字数小于M / 2，并且前节点关键字数大于M / 2，则从其处借补 
        self.remove_op(key);
        var entry = self.prev.entries.pop();
        self.entries.unshift(entry);
      } else if(self.next && self.next.entries.length >Math.floor(tree.order/ 2) && self.next.entries.length > 2 && self.next.parent === self.parent) {//向后节点借补
        self.remove_op(key);
        var entry = self.next.entries.shift();
        self.entries.push(entry);
      } else { //合并
        if(self.prev && (self.prev.entries.length <= Math.floor(tree.order/ 2) || self.prev.entries.length <= 2) && self.prev.parent === self.parent) {//与前节点合并
          self.remove_op(key);
          self.entries = self.prev.entries.concat(self.entries);
          var index = self.parent.children.indexOf(self.prev);
          self.parent.children.splice(index,1);
          self.prev.parent = null;
          self.prev.entries = null;
          if(self.prev.prev) {
            var temp = self.prev;
            temp.prev.next = self;
            self.prev = temp.prev;
            temp.prev = null;
            temp.next = null;
          } else {
            tree.head = self;
            self.prev.next = null;
            self.prev = null;
          }
        } else if(self.next && (self.next.entries.length <= Math.floor(tree.order/ 2) || self.next.entries.length <= 2) && self.next.parent === self.parent){ //与后节点合并
          self.entries = self.entries.concat(self.next.entries);
          self.remove_op(key);
          var index = self.parent.children.indexOf(self.next);
          self.parent.children.splice(index,1);
          self.next.parent = null;
          self.next.entries = null;
          if(self.next.next) {
            var temp = self.next;
            temp.next.prev = self;
            self.next = temp.next;
            temp.prev = null;
            temp.next = null;         
          } else {
            self.next.prev = null;
            self.next = null;
          }
        }
      } 
    }
    self.parent.update_remove(tree); 
  } else {
    if(key <= self.entries[0].key) {//如果key小于等于节点最左边的key，沿第一个子节点继续搜索 
      self.children[0].remove(key, tree);
    } else if( key >= self.entries[self.entries.length - 1].key) {
      self.children[self.children.length - 1].remove(key, tree);
    } else {
      for(var i = 0; i < self.entries.length; i++) {
        if(key <= self.entries[i].key){
          self.children[i].remove(key, tree);
          break;
        }
      }
    }
  }
}


Node.prototype.insert_or_update = function(key, obj, tree) {//插入或修改
  var self = this;
  
  if(self.is_leaf) {//如果是叶子节点
    if(self.contains(key) || (self.entries.length < tree.order)) {//不需要分裂，直接插入或更新 
      self.insert_or_update_op(key, obj);
      if(self.parent) {
        self.parent.update_insert(tree);
      }
    } else {//分裂
      var left = new Node(true);
      var right = new Node(true);
      if(self.prev) {
        self.prev.next = left;
        left.prev = self.prev;
      }
      if(self.next) {
        self.next.prev = right;
        right.next = self.next;
      }
      if(!self.prev) {
        tree.head = left;
      }
      left.next = right;
      right.prev = left;
      self.prev = null;
      self.next = null;
      var left_len = Math.floor((tree.order + 1) / 2) + (tree.order + 1) % 2; 
      var right_len = Math.floor((tree.order + 1) / 2);
      self.insert_or_update_op(key, obj);
      for(var i = 0; i < left_len; i++) {
        left.entries[i] = self.entries[i];
      }
      for(var i = 0; i < right_len; i++) {
        right.entries[i] = self.entries[left_len + i];
      }
      self.update_parent(left, right, tree);
    }
  } else {//如果不是叶子节点 
    if(key <= self.entries[0].key) {//如果key小于等于节点最左边的key，沿第一个子节点继续搜索 
      self.children[0].insert_or_update(key, obj, tree);
    } else if( key >= self.entries[self.entries.length - 1].key) {
      self.children[self.children.length - 1].insert_or_update(key, obj, tree)
    } else {
      for(var i = 0; i < self.entries.length; i++) {
        if(self.entries[i].key >= key) {
          self.children[i].insert_or_update(key, obj, tree);
          break;
        }
      }
    }
  }
}

Node.prototype.update_parent = function (left, right, tree) {
  var self = this;
  if(self.parent) { //如果不是根节点  
    //调整父子节点关系 
      var index = self.parent.children.indexOf(self);
      self.parent.children.splice(index,1,left,right);
      left.parent = right.parent = self.parent;
      self.entries = null;
      self.children = null;
      self.parent.update_insert(tree);
      self.parent = null;
    } else {
      self.is_root = false;
      var parent = new Node(false, true);
      tree.root = left.parent = right.parent = parent;
      parent.children.push(left);
      parent.children.push(right);
      self.entries = null;
      self.children = null;
      parent.update_insert(tree); 
    }
}
Node.prototype.update_insert = function(tree) {//插入后中间节点的更新
  var self = this;
  self.validate(tree);
  if(self.children.length > tree.order) {//如果子节点数超出阶数，则需要分裂该节点
    var left = new Node(false);
    var right = new Node(false);
    var left_len = Math.floor((tree.order + 1) / 2) + (tree.order + 1) % 2; 
    var right_len = Math.floor((tree.order + 1) / 2);
    //复制子节点到分裂出来的新节点，并更新关键字
    for(var i = 0; i < left_len; i++) {
      left.children.push(self.children[i]);
      left.entries.push({key: self.entries[i].key});
      self.children[i].parent = left;
    }
    for(var i = 0; i < right_len; i++) {
      right.children.push(self.children[i + left_len]);
      right.entries.push({key: self.entries[i + left_len].key});
      self.children[i + left_len].parent = right;
    }
   self.update_parent(left, right, tree);
 }
}

Node.prototype.update_remove = function(tree) {//删除节点后中间节点的更新
  var self = this;
  self.validate(tree);
  if(self.children.length < Math.floor(tree.order/ 2) || self.children.length < 2) {//如果子节点数小于M / 2或者小于2，则需要合并节点
    if(self.is_root) {
      if(self.children.length >= 2) { // 如果是根节点并且子节点数大于等于2，OK 
        return;
      } else {//与子节点合并
        var root = self.children[0];
        tree.root = root;
        root.parent = null;
        root.is_root = true;
        self.entries = null;
        self.children = null;
      }
    } else {

      var c_index = self.parent.children.indexOf(self);
      var p_index = c_index - 1;
      var n_index = c_index + 1;
      var prev = null, next = null;
      if(p_index >= 0) {
        prev = self.parent.children[p_index];
      }
      if(n_index < self.parent.children.length) {
        next = self.parent.children[n_index];
      }
      // 如果前节点子节点数大于M / 2并且大于2，则从其处借补 
      if(prev && prev.children.length > Math.floor(tree.order/ 2) && prev.children.length > 2) {
        var borrow = prev.children.pop();
        borrow.parent = self;
        self.children.unshift(borrow);
        prev.validate(tree);
        self.validate(tree);
        self.parent.update_remove(tree);
        // 如果后节点子节点数大于M / 2并且大于2，则从其处借补 
      } else if(next && next.children.length > Math.floor(tree.order/ 2) && next.children.length > 2) {
        var borrow = next.children.shift();
        borrow.parent = self;
        self.children.push(borrow);
        next.validate(tree);
        self.validate(tree);
        self.parent.update_remove(tree);
        // 否则需要合并节点 
      } else {
        if(prev && (prev.children.length <= Math.floor(tree.order/ 2) || prev.children.length <= 2)) {
          for(var i = prev.children.length -1 ; i >=0 ; i--) {
            var child = prev.children[i];
            child.parent = self;
            self.children.unshift(child)
          }
          prev.children = null;
          prev.entries = null;
          prev.parent = null;
          self.parent.children.splice(p_index, 1);
          self.validate(tree);
          self.parent.update_remove(tree);
        } else if(next && (next.children.length <= Math.floor(tree.order/ 2) || next.children.length <= 2)) {
          for(var i = 0  ; i < next.children.length; i++) {
            var child = next.children[i];
            child.parent = self;
            self.children.push(child)
          }
          next.children = null;
          next.entries = null;
          next.parent = null;
          self.parent.children.splice(n_index, 1);
          self.validate(tree);
          self.parent.update_remove(tree);
        }
      }
    }
  } 
}



Node.prototype.validate = function(tree) {//调整节点关键字
  var self = this;
  if(self.entries.length === self.children.length) {// 如果关键字个数与子节点个数相同
    for(var i = 0; i < self.entries.length; i++) {
      var len = self.children[i].entries.length;
      var key = self.children[i].entries[len-1].key ;//超过最大值
      if(key !== self.entries[i]) {
        self.entries[i] = {key:key};
        if(!self.is_root) {
          self.parent.validate(tree)
        }
      }
    }

  } else{
    self.entries = []; 
    for(var i = 0; i < self.children.length; i++) {
      var len = self.children[i].entries.length;
      var key = self.children[i].entries[len-1].key ;
      self.entries.push({key:key});
      if(!self.is_root) {
        self.parent.validate(tree)
      }
    }
  }
}



Node.prototype.insert_or_update_op = function(key, val) {//从当前节点中更新关键字
  var self = this;
  var new_entry = {
    key :key,
    val: val
  };
  if(self.entries.length === 0) {
    self.entries.push(new_entry)
    return 
  } 
  for(var i = 0; i < self.entries.length; i++) {
    var entry = self.entries[i];
    if(entry.key === key) {
      entry.val = val;
      return;
    } else if (entry.key > key){
      self.entries.splice(i, 0, new_entry);
      return;
    }
  }
  self.entries.push(new_entry)
}

Node.prototype.remove_op = function(key) {
  var self = this;
  var low = 0, high = self.entries.length - 1, mid, comp;
  while(low <= high) {
    mid = Math.floor((low + high) / 2);
    comp = self.entries[mid].key - key;
    if(comp === 0) {
      return self.entries.splice(mid, 1)[0];
    } else if(comp < 0) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return null;
}

Node.prototype.contains = function(key) {
  var self = this;
  var low = 0, high = self.entries.length - 1, mid, comp;
  while(low <= high) {
    mid = Math.floor((low + high) / 2);
    comp = self.entries[mid].key - key;
    if(comp === 0) {
      return true;
    } else if(comp < 0) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return false;
}

// ===============================Bplus Tree========================
var BplusTree = function(m) {
  var self = this;
  self.root = new Node(true, true);//根节点
  self.head = self.root;
  self.order = m;//阶数
}

BplusTree.prototype.get = function(key) {
  var self = this;
  return self.root.get(key, self);
}

BplusTree.prototype.remove = function(key) {
  var self = this;
  self.root.remove(key, self);
}

BplusTree.prototype.insert_or_update = function(key, val) {
  var self = this;
  self.root.insert_or_update(key, val, self);
}

//==========================TEST================================
var tree = new BplusTree(4);
var arr = [2,89,6,4,8,9,12,45,37,24,60,21,32,49,7,5,34,22,13,14,15]
for(var i = 0 ; i < arr.length; i++) {
  var num = arr[i];
  var val = num +'_val';
  tree.insert_or_update(num, val);
}