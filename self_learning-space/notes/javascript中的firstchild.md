javascript中的firstchild

  <ul id="contain">
       <li><a href="http:/www.iwcn.net">Microsotf</a></li>
       <li><a href="http:/www.iwcn.net">Yahoo</a></li>
       <li><a href="http:/www.iwcn.net">Easy</a></li>
       <li><a href="www.iwcn.net">W3c/Javascript</a></li>
       <li><a href="www.iwcn.net">Design|Source</a></li>
   </ul>
  var container=document.getElementById("contain"); 
1、使用firstChild是ul元素下的第一个子节点（包括文本节点、HTML元素节点）。所以按照标准，你这个例子在Firefox和Opera中，container.firstChild应该获取空白符的文本节点。而IE不是这样实现的，如果文本节点只包含空白符，IE会直接跳过。所以在IE中通过container.firstChild你获得的是li元素节点。

2、firstChild是元素的所有子节点（childNodes）中的第一个子节点，如果元素的第一个子节点没有变化，则firstChild这个引用也不会有变化。连续获取两次firstChild是同一个对象。

补充：你要了解引用与对象的关系。firstChild是指向元素首个子节点的引用。你给的xx函数中，将firstChild引用指向的对象append到父对象的末尾，原来firstChild引用的对象就跳到了container对象的末尾，而firstChild就指向了本来是排在第二个的元素对象。如此循环下去，链接就逐个往后跳了。

  <body>
  <ul id="action">
      <li title="第一段文字">第一个</li>
      <li title="第二段文字">第二个</li>
  </ul>
  <script type="text/javascript">
      var attr_p = document.getElementById("action");
      alert(attr_p.childNodes[1].childNodes[0].nodeValue);
  </script>
  </body>
如果要取得id为action的ul的第一个li内的文本节点（如取得：第一个），可以使 用…childNodes[1].childNodes[0].nodeValue这种方法找到，使用…childNodes[1].firstChild.nodeValue同样可以找到第一个li的文本节点，
结论 childNodes[0]等价于firstChild，无论何时何地，重要需要访问childNodes[]数组的第一个元素，我们就可以把它写成firstChild，DOM还提供一个与之对应的lastChild属性。需要注意的是，ff的空格节点问题，可以使用nodeType属性对节点类型判断，直到发现元素节点为止。