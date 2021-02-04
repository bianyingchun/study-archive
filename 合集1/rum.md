1.基本概念
  1.RUM 参考了GIN的实现，并改进了GIN在全文检索时的一些弱点：
    1.排序缓慢。它需要关于词表的位置信息来排序。GIN索引不存储LexMes的位置。因此，索引扫描之后，我们需要额外的堆扫描来恢复词汇位置。
    2.短语搜索缓慢。这个问题与1相似。执行短语搜索也需要位置信息。
    3.按时间戳进行排序缓慢。GIN索引不能在索引中存储一些相关信息。因此，有必要进行额外的堆扫描。

  2.RUM通过在posting-tree中存储附加信息来解决这个问题。例如，位置信息或时间戳的位置信息。

  3.RUM的缺点是它比GIN具有更慢的构建和插入时间。这是因为除了key之外，我们还需要存储附加信息。

2.operator：
  tsvector <=> tsquery
    返回tsvector和tsquery的距离
  timestamp <=> timestamp
    返回两个时间戳的距离
  timestamp <=| timestamp
    返回左时间戳的距离
  timestamp |=> timestamp
    返回右时间戳的距离

3.operator classes
  1.rum_tsvector_ops
  For type: tsvector
    存储具有位置信息的TsVector lexemes，支持通过<=>运算符和前缀搜索进行排序

  2.rum_tsvector_hash_ops
  For type: tsvector
    存储具有位置信息的TsVector lexemes hash散列表，支持通过<＝>运算符排序。但不支持前缀搜索。
