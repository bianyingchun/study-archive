简介：
  GIN(通用倒排索引)是一个存储对（key, posting list）集合的索引结构，其中key是一个键值，posting list 是一组出现过key的位置集合，如('hello','14:26','23:1',...'),其中hello表示键值，而'14:26','23:1'..'表示hello出现的位置，每一个位置由“ID：位置”表示，14:26说明hello在14号元组的被索引属性中第26个位置出现，每一个被索引的属性都可能包含多个键值，因此同一个元祖ID可能出现在多个posting list中.通过这种索引结构可以快速查找到指定关键字的元组，因此GIN索引特别适合全文搜索。
定义一个GIN访问方法所要做的就是实现5个用户定义的方法，
这些方法定义了键值、键值与键值之间的关系、被索引值、能够使用索引的查询以及部分匹配。
1.索引接口：
  1.compare方法：
    比较两个键值a和b，然后返回一个整数值，返回负值表示a < b，返回0表示a = b，返回正值表示a > b。
    int compare(Datum a, Datum b)

  2.extractValue方法：
    根据参数inputValue生成一个键值数组，并返回其指针，键值数组中元素的个数存放在另一个参数nkeys中。
    Datum *extractValue(Datum inputValue, int32 *nkeys)  

  3. extractQuery方法：
    根据一个查询（参数query）生成一个用于查询的键值数组，并返回其指针。
    Datum *extractQuery(Datum query, int32 *nkeys, StrategyNumber n, bool **pmatch, Pointer **extra_data)  
    extractQuery通过参数n指定的操作符策略号来决定query的数据类型以及需要提取的键值，返回键值数组的长度存放在nkeys参数中。
    如果query中不包含键值，则nkeys可以为0或者-1：
    nkeys = 0 表示索引中所有值都满足查询，将执行完全索引扫描(查询null时是这样); nkeys = -1 表示索引中没有键值满足查询，跳过索引扫描。
    在部分匹配时，输出参数pmatch记录返回的键值数组中的每一个键值是否请求部分匹配。
    输出参数extra_data用来向consistent和comparPartial方法传递用户自定义需要的数据。extra_data指向一个长度为nkeys的指针数组，extractQuery可以在每一个数组元组所指向的内存空间存放任何数据，如果extra_data不为空，则extra_data指向的整个数组都将被传递给consistent方法，而其中适当的元素将被传递给comparePartial方法。

  4. consistent方法：
    用于检查索引值是否满足查询
    bool consistent(bool check[], StrategyNumber n, Datum query, int32 nkeys, Pointer extra_data[], bool *recheck)  
    如果索引值满足查询则返回true，如果recheck = true，则返回true的索引还需要进一步的检查。
    recheck: 精确比较时recheck = false；否则recheck = true，通过索引找到的基表元组还需要进行是否满足操作符的检查（在TSVector类型时，如果key带有权值，则recheck = true）。

  5. comparePartial方法：
    将部分匹配的查询与索引值进行比较，返回值为负值表示两者不匹配，但继续索引扫描；返回值为0表示两者匹配；返回值为正值表示停止扫描。
    int comparePartial(Datum partial_key, Datum key, StrategyNumber n, Pointer extra_data)  

  6.为可选接口，用于partial match，类似lossy index.
    int comparePartial(Datum partial_key, Datum key, StrategyNumber n, Pointer extra_data)  
    所以在PG中添加一种新的数据类型并且让GIN支持该数据类型，则需要完成以下步骤：
    1. 添加数据类型
    2. 为新数据类型实现并注册各种操作符所需要的函数，然后创建新类型的操作符
    3. 用CREATE OPERATOR CLASS为新的数据类型创建一个操作符类，该语句需要指定GIN索引所需要的5个支持函数
    PG的GIN索引，内部实现了对于TSVector数据类型的支持，并提供了把TEXT类型转换成TSVector的接口，所以可以说PG的GIN索引支持TSVector和TEXT的数据类型。


2.物理结构
  GIN索引在物理存储上包含如下内容：

  1. Entry：GIN索引中的一个元素，可以认为是一个词位，也可以理解为一个key

  2. Entry tree：在Entry上构建的B树

  3. posting list：一个Entry出现的物理位置(heap ctid, 堆表行号)的链表

  4. posting tree：在一个Entry出现的物理位置链表(heap ctid, 堆表行号)上构建的B树，所以posting tree的KEY是ctid，而entry tree的KEY是被索引的列的值

  5. pending list：索引元组的临时存储链表，用于fastupdate模式的插入操作

  从上面可以看出GIN索引主要由Entry tree和posting tree（or posting list）组成。

    1.Entry tree是GIN索引的主结构树, entry tree类似于b+tree，用来组织和存储(key, posting list)对,其叶子节点与普通btree的叶子节点不同，普通btree的叶子节点指向其索引的元组，而entry tree的叶子节点指向posting list，或者是posting tree。该指针用索引元组结构的tid表示。[如果某个Entry出现的位置较多，则在其出现的位置也就是POSiting list上再创建一个Btree，以加快查找的速度]

    非叶子节点的每个元组都有一个指向孩子节点的指针(child pointer)，该指针由索引元组结构的tid(表示下层数据块ID，即下层GIN索引数据块ID)来表示，中间节点和叶子节点还有一个右兄弟节点指针，指向其右兄弟节点，该指针记录在GinPageOpaqueData的rightlink内(即索引页的special部分，在页面的尾部)。
    //如果posting list退化成单个item pointer，则GIN索引的结构就与B树索引几乎完全一样

    2.posting tree是辅助树, posting tree则类似于b-tree。其树结构与entry tree完全一样，不同之处就是posting tree页面存储的元组内容与entry tree不同：
      (a).posting tree 非叶子节点，KEY是堆表行号，VALUE是下层节点的块ID。
      (b).posting tree 叶子节点，是堆表行号list, 即posting list，（PostgreSQL使用了segment进行管理，将posting list中存储的item point(堆表行号)有序分段，压缩存储）。


    3.pending list是在fastupdate时，用来临时缓存GIN索引元组的，该链表把索引的插入操作推迟到一定条件时，批量处理。其结构是一个单向链表。
      pending list的meta页面用来指示pending list的头和尾的页面号，没有pending list的数据页面，存放的是新的索引元组。


3.页面结构
  1.GIN_DATA (1 << 0):存放posting tree的页面
  2.GIN_LEAF (1 << 1):叶子页面
  3.GIN_DELETED(1 << 2): 被标志删除的页面
  4.GIN_META(1<<3):GIN索引的元页面
    主要记录pending list的相关信息、统计信息和版本号
  5.GIN_LIST(1<<4):Pending list 页面
  6.GIN_LIST_FULLROW (1 << 5) 被填满的GIN_LIST页面
//=====================================================================================================
   1.GIN索引页面的 special区
   GIN索引页面的special区，用来存储GIN索引相关的信息，与BTree的BTPageOpaqueData类似，主要是建立树形结构。
   
   2.entry tree页面
    1.entry-tree非叶子页面
      非叶子页面不带任何标记信息，entry tree的非叶子页面结构与普通btree的非叶子页面结构基本上是一样的(但实际上与PostgreSQL nbtree有差异，如, 并非双向链表)，如下：
            page_header
        ------------------
            indexTuples
        ------------------
            special区
        ------------------

    2.entry-tree叶子页面
    叶子页面带有GIN_LEAF标记，表示是entry tree的叶子页面。entry tree的叶子页面与普通btree叶子页面结构类似，只是在元组结构上有所不同，(实际上与PostgreSQL nbtree有差异，如, 并非双向链表)，如下：
            page_header
        ------------------
            indexTuples
        ------------------
            special区
        ------------------

  3. posting tree页面 (由GIN_DATA标记)
    1.posting tree非叶子页面GIN_DATA
    非叶子页面只有GIN_DATA标记，其页面结构如下：
      page_header|itemPointer
      --------------------
          PostingItem
      --------------------
          special区
      --------------------

    PageHeader后面紧跟的一个ItemPointer是指该PAGE的right bound，即它所指引的所有下级节点中，最大指向的HEAP tid。
    比如你抓了一手扑克牌，按牌面从小到大顺序分成了若干堆牌，你有指向每一堆牌的方法（PostingItem），同时也知道最大的牌是什么(PageHeader后面紧跟的一个ItemPointer)
    与普通btree的页面类似，不同是其存储的元组是PostingItem，PostingItem格式为：

    2.posting tree叶子页面
    叶子页面的标记为GIN_DATA|GIN_LEAF，其页面结构如下:
      page_header|itemPointer
      --------------------
         itemPointer list
      --------------------
         special区
      --------------------
    与正常的索引页面类似，开始是页面头信息，结尾是special区，不同的是中间区用来记录posting list(即HEAP CTID)。注意posting list会分段压缩存储，包括用于SKIP优化等。

    4.pending list 页面
      与entry tree的页面类似，如下：
            page_header
        ------------------
            indexTuples
        ------------------
            special区
        ------------------
      不同之处是元组的结构，将在元组结构中介绍。
      special区有一个指针，用来指向页面的下一个页面，这样就把所有的pending list页面以单链表的方式组织起来。


4.元组结构
  1.entry tree 内的 indextuple 元组
      entry tree的元组依然使用IndexTuple来表示，其结构为：
      typedef struct IndexTupleData  
      {  
              ItemPointerData t_tid;          /* reference TID to heap tuple */  指向下层节点的指针
        
              unsigned short t_info;          /* various info about tuple */  元祖信息
      } IndexTupleData; 
      //但是对于不同的节点，其t_tid和后面的key会有所不同。
      1.非叶子节点
      tid--flags--key
      // 与普通索引的元组结构一样，由IndexTupleData和key组成，KEY存储的都是被索引列的值，不同的是，其t_tid不是指向heap 元组，而是指向孩子页面。
      2.叶子结点
      (a)
        tid--flags--key

      (b)
        tid--flags--key--PostingList

        注意entry tree 叶子节点的tid已经没有指向意义(指向KEY对应的heap的ctid)了，因为具有指向意义的内容存储在VALUE里面: 即posting list, 或者指向posting tree root page的pointer。
      那么entry tree 叶子节点的tid用来干什么呢？如下:

      1.元组结构a(posting list) :
      由于posting list太长，无法存储在元组内部，所以把posting list采用外部存储，索引元组只记录posting tree的root页面号。
      为了区分这两种结构，使用元组中的tid中的ip_posid(tid ItemPointerData结构的后半部，只有2字节)来区分，
      ip_posid == GIN_TREE_POSTING，则表示记录的是posting tree，此时tid的ip_blkid用来存储posting tree的root页面号。

      2.元组结构b(posting tree) :
      把posting list直接存储到key后面的连续空间中，使用tid的ip_posid(2字节)来存储posting list的长度，tid的ip_blkid(4字节)来存储posting list在元组内部的偏移。

  2.posting tree 内的 indextuple 元组
    posting tree的元组格式比较简单，就是itempointer或者postingitem 
    1.非叶子结点
    [child pointer (指向孩子节点)] [item pointer (孩子节点的最小?heap ctid)]  

    2.叶子结点
    [item pointer list]  (posting list分段压缩存储)

  3.pending list 内的 indextuple 元组
    pending list的页面存储的是临时的索引元组，其元组格式为：
    [tid] [flags] [key]  
    其中tid指向的是heap元组，这与普通元组一样。key 为被索引的列值(row tuple)


5.索引的构建
  调用用户定义的compare接口来实现entry的比较，而extratValue接口用来把基表的属性值提取出对应的entry。GIN索引在构建时为了提高性能，使用了一种RB二叉树的结构来缓存索引元组，然后在RB二叉树大于maintenance_work_mem时，批量的把RB树中的索引元组插入到GIN的entry tree中。

  1. 初始化GinState结构

  主要是从系统表中读取GIN索引支持的那5个用户自定义函数：compare、extractValue、extractQuery、consistent、comparePartial

  2. 初始化meta和root页面

    其中meta页面的blkno是0，root页面的blkno是1

  3. 记录构建日志

  4. 初始化构建时的临时内存上下文和用于缓存的RB树

  5. 调用IndexBuildHeapScan扫描基表，并调用ginBuildCallback对每个基表的索引属性处理
    ginBuildCallback实现对每个基表列的处理：
    (a) 对每一个索引列，调用extractValue接口提取entry值
    (b) 把所有的<entry, colno, heap tid>对插入到RB树中
    (c) 如果RB树大于maintenance_work_mem，则把RB树中的<entry, colno, heap tid>对插入到GIN索引中
    此处在查找entry的插入位置时，会调用compare接口比较两个entry之间的大小

  6. 把RB树中的所有索引元组插入到GIN的entry tree中

  7. 结束


6.索引的扫描
  gingetbitmap GIN扫描接口

    gingetbitmap是实现GIN扫描的接口，该接口根据GinScanKey把满足过滤条件的所有基表元组的tid存储到bitmap中。
    bitmap的大小由work_mem参数控制，如果gin索引扫描出过多元组，则bitmap会自动的根据需要选择lossy存储。bitmap的lossy存储是不再存储元组的tid而是直接存储元组所在页面的blkno。由于此种存储bitmap没有存储具体元组，所以在执行层必须对bitmap返回的元组做recheck。

    gingetbitmap会调用用户4个自定义的接口：compare、extractQuery、consistent、comparePartial。compare在entry scan时用于比较两个entry key的大小；extractQuery用来把查询字符串转换成entry key；consistent用来合并每一个GinScanKey的结果集；comparePartial用来实现部分匹配。gingetbitmap的流程如下：

  1. 把ScanKey转换成GinScanKey
    会调用extractQuery把查询字符串转换成entry key，然后对每个entry key创建一个GinEntryScan

  2. 扫描pending list，把满足条件的基表元组tid加入到bitmap中

  3. 对每个GinEntryScan进行扫描，找到GinEntryScan的key对应的叶子节点

    (a) 如果是部分匹配，则把所有满足部分匹配的基表元组存储GinEntryScan的临时bitmap中会调用comparePartial进行索引entry 与查询key之间的部分匹配。
    (b)如果是精确查找，则把索引元组的posting list或者posting tree的root页面的posting list，存储到GinEntryScan的list中。

  4. 循环获取满足查询条件的基表元组：
    (a) 对每一个GinScanKey，调用consistent，合并GinScanKey中所有GinEntryScan的结果
    (b) 把所有GinScanKey的结果合并，一次一条的返回
    (c) 把满足条件的基表元组tid插入到bitmap中

  5. 返回查询到的基表元组个数


7.insert和fastupdate优化
  1.GIN索引基表增加一行，GIN索引可能需要增加多个索引项。所以GIN索引的插入是低效的。所以PG为了解决这个问题，实现了两种插入模式：

    1.正常模式
      基表元组产生的新的GIN索引，会被立即插入到GIN索引

    2.fastupdate模式
      基表元组产生的新的GIN索引，会被插入到pending list中，而pending list会在一定条件下批量的插入到GIN索引中

      1.开启和关闭fastupdate模式
        通过create index 的WITH FASTUPDATE = OFF来关闭fastupdate模式，默认情况下是开启fastupdate模式

      2.对索引扫描的影响
        在fastupdate模式下，新的索引元组以追加的方式插入到pending list中，不会进行任何的排序和去重操作，所以，在扫描时，只能顺序扫描，因此pending list的扫描效率是非常低的，必须保证pending list的大小不要太大.

      3.对插入的影响
        通常情况下，在fastupdate模式下，基表的更新效率是比较高的，但是如果一个事务的更新刚好让pending list到达临界点，而导致合并操作，则会使该事务比正常的事务慢很多

      4.pending list的合并
        把pending list的索引元组合并到GIN索引树上有2种触发条件：
        (a)当pending list所占空间大于work_mem时

        (b)在vacuum 索引的基表时（包括autovacuum在内）??
      因此可以根据autovacuum的间隔时间和work_mem来控制pending list的大小，避免其过大而拖慢扫描速度
      在pending list合并时，其采用与GIN索引构建时相同的方式，即先把pending list内的数据，组织成一个RB树，然后再把RB树合并到GIN索引上。RB树可以把pending list中无序的数据变成有序，并且可以合并重复key的项，提高插入效率。


8. GIN索引的vacuum
  GIN索引的vacuum是用来清理无用的posting list或者posting tree的，GIN索引的vacuum与btree索引的vacuum一样，提供了两个接口ginbulkdelete和ginvacuumcleanup。
  GIN索引的vacuum主要是清理entry tree和posting tree，如果entry的posting list为空了，vacuum依然不会删除该entry，说明entry tree中的entry永远不会被删除；对于posting tree，如果posting tree也空了，在系统依然会把posting tree的root页面保留，并关联到entry上面。

  PS：postgresql中执行delete操作后，表中的记录只是被标示为删除状态，并没有释放空间，  在以后的update或insert操作中该部分的空间是不能够被重用的。
    在postgresql中用于维护数据库磁盘空间的工具是VACUUM，其重要的作用是删除那些已经标示为删除的数据并释放空间。经过vacuum清理后，空间才能得到释放。
    VACUUM回收已删除元组占据的存储空间。在一般的PostgreSQL操作里，那些已经DELETE的元组或者被UPDATE过后过时的元组是没有从它们所属的表中物理删除的；在完成VACUUM之前它们仍然存在。因此我们有必须周期地运行VACUUM，特别是在常更新的表上。


9.TSVector类型的GIN索引
  PG默认提供了对TSVector数据类型的GIN索引的支持，并提供了对TEXT类型转换TSVector类型的接口，因此PG在对TEXT类型的属性建立GIN索引时，需要使用to_tsvector接口把TEXT类型转换成TSVector。

  全文检索分为两个数据类型，一个是分词，一个是查询词组合。
  1.TSVector//分词类型
    1.TSVector是PG中的一种数据类型，用来实现全文搜索。它实际上是一个<key, pos list>的数组，其中key是一个关键词，pos list是key在字符串中出现的位置列表。如字符串:
    'Before you can use PostgreSQL you need to install it'  
    在转换成TSVector后的值为：
    [Before, 1] [you, 2:6] [can, 3] [use, 4] [PostgreSQL, 5] [need, 7] [to, 8] [install, 9] [it, 10]  
    因此TSVector实际上就是一组key和其出现位置的集合。
    2.对于TEXT类型，在更新索引时，会先调用to_tsvector把基表的索引列的字符串转换成TSVector表示的key和位置列表的集合，然后在使用用户自定义的extractValue把TSVector中所有的key提取出来，对每个key创建一个索引元组，然后插入到GIN索引中。

  2.TSQuery//查询词组合
    TSQuery用来表示全文搜索的查询，PG提供了一个to_tsquery和plainto_tsquery接口把待查询的字符串格式化成TSQuery，
    在GIN扫描之前会把TSQuery中的key使用函数extractQuery提取出来，并为每个key创建一个GinScanEntry。在GIN扫描时，会对每个GinScanKey调用consistent接口根据TSQuery中记录的key之间的关系(&、|、！)合并每个GinScanEntry的结果集。

//==================================================================================
全文搜索相关：
  1.全文检索分为两个数据类型，一个是分词，一个是查询词组合。
    1. 分词类型TSVector
      就是将字符串，根据选择的分词配置规则，转换为分词的类型，你可以理解为一堆被抽象出来的lexeme。
      分词转换：to_tsvector('english', 'Hi i''m digoal, a pger, are you pger?') =>'digoal':4 ,'hi':1 ,'m':3 ,'pger':6,9 //过滤的都是没有意义的词，例如i an am等，可以自定义
      tsvector还有段落或权重的概念例如正文，标题，副标题。一共分4级，A,B,C,D，可以标示对应的lexeme出现在哪个层面的哪个位置。
      'a:1A fat:2B,4C cat:5D'::tsvector;

    2.查询词组类型TSQuery
      就是要查询的词组。可以任意组合，需要对其指定配置，进行lexeme判断，过滤。
      例如：to_tsquery('english', 'mysql&(postgresql|abc)');
      可选地，tsquery中的lexemes可以用一个或多个权重字母来标记，这限制它们仅匹配具有这些权重之一的tsvector lexemes：
      tsquery还支持前缀查询：to_tsquery('english', 'postgres:*' );此查询将匹配以“postgres”开头的tsvector中的任何单词。

  2.全文检索类型操作符：
    1.@@  分词字段是否包含了需要查找的词组
      to_tsvector('fat cats ate rats') @@ to_tsquery('cat & rat')
      return 
      true;

    2.@@@
      to_tsvector('fat cats ate rats') @@@ to_tsquery('cat & rat')
      return
      true 

    3.|| 将两个分词字段的内容合并
    'a:1 b:2'::tsvector || 'c:1 d:2 b:3'::tsvector
      return
      'a':1 'b':2,5 'c':3 'd':4

    4.&& 将两个查询词组的内容执行与操作
      'fat | rat'::tsquery && 'cat'::tsquery
      return
      ( 'fat' | 'rat' ) & 'cat'

    5.|| 将两个查询词组的内容执行或操作
    'fat | rat'::tsquery || 'cat'::tsquery
      return
    ( 'fat' | 'rat' ) | 'cat'

    6.!! 排除查询词组的内容
    !! 'cat'::tsquery
      return
    !'cat'

    7.<-> 表示两个相邻的查询词组
      to_tsquery('fat') <-> to_tsquery('rat')
      return
    'fat' <-> 'rat'
    postgres=> select to_tsvector('english', 'Hi i''m digoal, a pger, are you pger?') @@ to_tsquery($$'digoal' <-> 'pger'$$);//digoal pger不相邻
    false
    postgres=> select t v ('english', 'hello world') @@ to_tsquery($$'hello' <-> 'world'$$);//hello world相邻
    true

    8.@> 两个词组字段的包含关系
    'cat'::tsquery @> 'cat & rat'::tsquery
    return
    false

    9.<@ 两个词组字段的包含关系
    'cat'::tsquery <@ 'cat & rat'::tsquery
      return
    true

  3.全文检索类型函数

  这个部分是tsvector或tsquery类型的数据库内置函数，支持很多常用的功能。例如
将数组转换为分词类型、获取当前的tsconfig（如english, chinese,...）、获取分词字段的长度（元素lexeme个数）、将字符串转换为查询词组、将phrase转换为查询词组（带有位置信息）。
  4.重要示例：
    1.phrase转换功能，支持相邻度
      中国道教文化”，分词后变成了中国 <-> 道教 <-> 文化，他们必须相邻才能匹配。 否则不匹配。如"中国人口普查，道教占比xx，文化程度xx"，这个分词是不匹配的。 如果你要匹配则可以使用原始的方法使用 中国 & 道教 & 文化 即可
      phraseto_tsquery('hello digoal') => 'hello' <-> 'digoal'
      plainto_tsquery('hello digoal zhou') =>'hello' & 'digoal' & 'zhou'

    2. 查询词组哪些支持索引搜索
      querytree('foo & ! bar'::tsquery)  =>foo支持索引  !bar不支持索引

    3. 添加或消除tsvector的weight（即ABCD）
      setweight('fat:2,4 cat:3 rat:5B'::tsvector, 'A')  //所有lexeme都添加A权重 
      => 'cat':3A 'fat':2,4 'rat':5A
      setweight('fat:2,4 cat:3 rat:5B'::tsvector, 'A', '{cat,rat}')  //cat,rat添加A权重
      =>'cat':3A 'fat':2,4 'rat':5A
      strip('fat:2,4 cat:3 rat:5A'::tsvector)  
      => 消除权重 'cat' 'fat' 'rat'

    4. 删除tsvector中指定的lexeme
    ts_delete('fat:2,4 cat:3 rat:5A'::tsvector, 'fat')  返回  'cat':3 'rat':5A
    ts_delete('fat:2,4 cat:3 rat:5A'::tsvector, ARRAY['fat','rat']) 返回  'cat':3

    5. 根据权重过滤分词
    例如 我只看标题和副标题是否匹配（假设标题和副标题的权重为A,B）。
    ts_filter('fat:2,4 cat:3b rat:5A'::tsvector, '{a,b}') 返回  'cat':3B 'rat':5A

    6.黑体表示匹配的词组
    ts_headline('x y z', 'z'::tsquery) =>'x y <b>z</b>'

    7.匹配百分比
    ts_rank(textsearch, query) //返回百分比
    //由于分词有标题，副标题，正文，段落（即权重）之分，所以它还支持为不同的权重，设置不同的系数，根据你设置的权重，计算匹配度
    设置A,B,C,D的系数为{0.1, 0.2, 0.4, 1.0}
    ts_rank_cd('{0.1, 0.2, 0.4, 1.0}', textsearch, query) 返回  2.01317

    8.查询词组重写功能，就像SQL REWRITE一样，或者像文本替换功能一样。
      将a替换为foo|bar    
      ts_rewrite('a & b'::tsquery, 'a'::tsquery, 'foo|bar'::tsquery)  返回  'b' & ( 'foo' | 'bar' )
      支持批量替换，例如使用QUERY，替换目标为s字段，替换为t。   
      SELECT ts_rewrite('a & b'::tsquery, 'SELECT t,s FROM aliases')  返回  'b' & ( 'foo' | 'bar' )

    9. 计算phrase，转换为tsquery，这里包含了lexeme之间的距离信息。
      tsquery_phrase(to_tsquery('fat'), to_tsquery('cat')) 返回 'fat' <-> 'cat'    --  制造fat和cat相邻的phrase
      tsquery_phrase(to_tsquery('fat'), to_tsquery('cat'), 10) 返回  'fat' <10> 'cat'   --  制造fat和cat相距10个token(包括被过滤的token)的phrase  

    10. 将tsvector转换为数组，数组没有位置信息
        tsvector_to_array('fat:2,4 cat:3 rat:5A'::tsvector) 返回  {cat,fat,rat}

    11.自动更新分词字段

    12.