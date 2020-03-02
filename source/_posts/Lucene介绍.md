---
title: Lucene介绍
date: 2019-06-26 11:02:50
tags: Lucene
categories: ELK
---

### 简介

​	为了更深入地理解ElasticSearch的工作原理，特别是索引和查询这两个过程，理解Lucene的工作原理至关重要。本质上，ElasticSearch是用Lucene来实现索引的查询功能的。

​	Lucene是一个成熟的、高性能的、可扩展的、轻量级的，而且功能强大的搜索引擎包。Lucene的核心jar包只有一个文件，而且不依赖任何第三方jar包。更重要的是，它提供的索引数据和检索数据的功能开箱即用。当然，Lucene也提供了多语言支持，具有拼写检查、高亮等功能；但是如果你不需要这些功能，你只需要下载Lucene的核心jar包，应用到你的项目中就可以了。



### 概念

- **analyzer**：Analyzer是分析器，它的作用是把一个字符串按某种规则划分成一个个词语，并去除其中的无效词语，这里说的无效词语是指英文中的“of”、“the”，中文中的“的”、“地”等词语，这些词语在文章中大量出现，但是本身不包含什么关键信息，去掉有利于缩小索引文件、提高效率与命中率。分词的规则千变万化，但目的只有一个：按语义划分。这点在英文中比较容易实现，因为英文本身就是以单词为单位的，已经用空格分开；而中文则必须以某种方法将连成一片的句子划分成一个个词语

- **Document**：一个Document代表索引库中的一条记录（书目录中的其中一个条目），也叫做文档。要搜索的信息封装成Document后通过IndexWriter写入索引库。调用Searcher接口按关键词搜索后，返回的也是一个封装后的Document列表。它是在索引和搜索过程中数据的主要表现形式，或者称“载体”，承载着我们索引和搜索的数据，它由一个或者多个域(Field)组成。用户提供的源是一条条记录，它们可以是文本文件、字符串或者数据库表的一条记录等等。一条记录经过索引之后，就是以一个Document的形式存储在索引文件中的。用户进行搜索，也是以Document列表的形式返回。
- **Field**：它是Document的组成部分，由两部分组成，名称(name)和值(value)。一个Document可以包含多个信息域，一个Document可以包含多个列，叫做Field。例如一篇文章可以包含“标题”、“正文”、“最后修改时间”等信息域，这些信息域就是通过Field在Document中存储的。Field有两个属性可选：存储和索引。通过存储属性你可以控制是否对这个Field进行存储；通过索引属性你可以控制是否对该Field进行索引。这看起来似乎有些废话，事实上对这两个属性的正确组合很重要，下面举例说明：还是以刚才的文章为例子，我们需要对标题和正文进行全文搜索，所以我们要把索引属性设置为真，同时我们希望能直接从搜索结果中提取文章标题，所以我们把标题域的存储属性设置为真，但是由于正文域太大了，我们为了缩小索引文件大小，将正文域的存储属性设置为假，当需要时再直接读取文件；我们只是希望能从搜索结果中提取最后修改时间，不需要对它进行搜索，所以我们把最后修改时间域的存储属性设置为真，索引属性设置为假。上面的三个域涵盖了两个属性的三种组合，还有一种全为假的没有用到，事实上Field不允许你那么设置，因为既不存储又不索引的域是没有意义的。
- **Term**：term是搜索的最小单位，它表示文档的一个词语，term由两部分组成：它表示的词语和这个词语所出现的field。
- **Token**：Analyzer返回的结果就是一串Token。Token包含一个代表词本身含义的字符串（也就是词本身）和该词在文章中相应的起止偏移位置，Token还包含一个用来存储词类型的字符串。token是term的一次出现，它包含term文本和相应的起止偏移，以及一个类型字符串。一句话中可以出现多次相同的词语，它们都用同一个term表示，但是用不同的token，每个token标记该词语出现的地方。
- **segment**：添加索引时并不是每个document都马上添加到同一个索引文件，它们首先被写入到不同的小文件，然后再合并成一个大索引文件，这里每个小文件都是一个segment。



​	Apache Lucene把所有的信息都写入到一个称为**倒排索引**的数据结构中。这种数据结构把索引中的每个Term与相应的Document映射起来，这与关系型数据库存储数据的方式有很大的不同。读者可以把倒排索引想象成这样的一种数据结构：数据以Term为导向，而不是以Document为导向。下面看看一个简单的倒排索引是什么样的，假定我们的Document只有title域(Field)被编入索引，Document如下：

- ElasticSearch Server (document 1)

- Mastering ElasticSearch (document 2)

- Apache Solr 4 Cookbook (document 3)

所以索引(以一种直观的形式)展现如下：

| Term          | count | Docs    |
| ------------- | ----- | ------- |
| 4             | 1     | <3>     |
| Apache        | 1     | <3>     |
| Cookbook      | 1     | <3>     |
| ElasticSearch | 2     | <1> <2> |
| Mastering     | 1     | <2>     |
| Server        | 1     | <1>     |
| Solr          | 1     | <3>     |

​	正如所看到的那样，每个词都指向它所在的文档号(Document Number/Document ID)。这样的存储方式使得高效的信息检索成为可能，比如基于词的检索(term-based query)。此外，每个词映射着一个数值(Count)，它代表着Term在文档集中出现的频繁程度。

​	当然，Lucene创建的真实索引远比上文复杂和先进。这是因为在Lucene中，**词向量**(由单独的一个Field形成的小型倒排索引，通过它能够获取这个特殊Field的所有Token信息)可以存储；所有Field的原始信息可以存储；删除Document的标记信息可以存储……。核心在于了解数据的组织方式，而非存储细节。

​	每个索引被分成了多个段(Segment)，段具有一次写入，多次读取的特点。只要形成了，段就无法被修改。例如：被删除文档的信息被存储到一个单独的文件，但是其它的段文件并没有被修改。

​	需要注意的是，多个段是可以合并的，这个合并的过程称为**segments merge**。经过强制合并或者Lucene的合并策略触发的合并操作后，原来的多个段就会被Lucene创建的更大的一个段所代替了。很显然，段合并的过程是一个I/O密集型的任务。这个过程会清理一些信息，比如会删除.del文件。除了精减文件数量，段合并还能够提高搜索的效率，毕竟同样的信息在一个段中读取会比在多个段中读取要快得多。但是，由于段合并是I/O密集型任务，建议不要强制合并，小心地配置好合并策略就可以了。



#### 分析你的文本

​	问题到这里就变得稍微复杂了一些。传入到Document中的数据是如何转变成倒排索引的？查询语句是如何转换成一个个Term使高效率文本搜索变得可行？这种转换数据的过程就称为文本分析(analysis)

​	文本分析工作由**analyzer**组件负责。analyzer由一个分词器(tokenizer)和0个或者多个过滤器(filter)组成,也可能会有0个或者多个字符映射器(character mappers)组成。

​	Lucene中的**tokenizer**用来把文本拆分成一个个的Token。Token包含了比较多的信息，比如Term在文本的中的位置及Term原始文本，以及Term的长度。文本经过**tokenizer**处理后的结果称为token stream。token stream其实就是一个个Token的顺序排列。token stream将等待着filter来处理。

​	除了**tokenizer**外，Lucene的另一个重要组成部分就是filter链，filter链将用来处理Token Stream中的每一个token。这些处理方式包括删除Token，改变Token，甚至添加新的Token。Lucene中内置了许多filter，读者也可以轻松地自己实现一个filter。有如下内置的filter：

- **Lowercase filter**：把所有token中的字符都变成小写

- **ASCII folding filter**：去除tonken中非ASCII码的部分

- **Synonyms filter**：根据同义词替换规则替换相应的token

- **Multiple language-stemming filters**：把Token(实际上是Token的文本内容)转化成词根或者词干的形式。

  所以通过Filter可以让analyzer有几乎无限的处理能力：因为新的需求添加新的Filter就可以了。



#### 索引和查询

​	在我们用Lucene实现搜索功能时，也许会有读者不明白：上述的原理是如何对索引过程和搜索过程产生影响？

​	索引过程：Lucene用用户指定好的analyzer解析用户添加的Document。当然Document中不同的Field可以指定不同的analyzer。如果用户的Document中有title和description两个Field，那么这两个Field可以指定不同的analyzer。

​	搜索过程：用户的输入查询语句将被选定的查询解析器(query parser)所解析，生成多个Query对象。当然用户也可以选择不解析查询语句，使查询语句保留原始的状态。在ElasticSearch中，有的Query对象会被解析(analyzed)，有的不会，比如：前缀查询(prefix query)就不会被解析，精确匹配查询(match query)就会被解析。对用户来说，理解这一点至关重要。

​	对于索引过程和搜索过程的数据解析这一环节，我们需要把握的重点在于：倒排索引中词应该和查询语句中的词正确匹配。如果无法匹配，那么Lucene也不会返回我们想要的结果。举个例子：如果在索引阶段对文本进行了转小写(lowercasing)和转变成词根形式(stemming)处理，那么查询语句也必须进行相同的处理，不然搜索结果就会是竹篮打水一场空。



### Lucene查询语言

#### 基础语法

​	用户使用Lucene进行查询操作时，输入的查询语句会被分解成一个或者多个Term以及逻辑运算符号。一个Term，在Lucene中可以是一个词，也可以是一个短语(用双引号括起来的多个词)。如果事先设定规则：解析查询语句，那么指定的analyzer就会用来处理查询语句的每个term形成Query对象。

​	一个Query对象中会存在多个布尔运算符，这些布尔运算符将多个Term关联起来形成查询子句。布尔运算符号有如下类型：

  - AND(与)：给定两个Term(左运算对象和右运算对象)，形成一个查询表达式。只有两个Term都匹配成功，查询子句才匹配成功。比如：查询语句"apache AND lucene"的意思是匹配含apache且含lucene的文档。

  - OR(或)：给定的多个Term，只要其中一个匹配成功，其形成的查询表达式就匹配成功。比如查询表达式"apache OR lucene"能够匹配包含“apache”的文档，也能匹配包含"lucene"的文档，还能匹配同时包含这两个Term的文档。

  - NOT(非)：这意味着对于与查询语句匹配的文档，NOT运算符后面的Term就不能在文档中出现。例如：查询表达式“lucene NOT elasticsearch”就只能匹配包含lucene但是不含elasticsearch的文档。

    此外，我们也许会用到如下的运算符：

  - **+**：如果想要查询语句与文档匹配，那么给定的Term必须出现在文档中。例如：希望搜索到包含关键词lucene，最好能包含关键词apache的文档，可以用如下的查询表达式："+lucene apache"。

  - **-**：如果想要查询语句与文档匹配，那么给定的Term不能出现在文档中。例如：希望搜索到包含关键词lucene，但是不含关键词elasticsearch的文档，可以用如下的查询表达式："+lucene -elasticsearch"。

    如果在Term前没有指定运算符，那么默认使用OR运算符。

    此外，也是最后一点：查询表达式可以用小括号组合起来，形成复杂的查询表达式。比如：

```elasticsearch AND (mastering OR book)```



#### 多域查询

​	当然，跟ElasticSearch一样，Lucene中的所有数据都是存储在一个个的Field中，多个Field形成一个Document。如果希望查询指定的Field，就需要在查询表达式中指定Field Name(此域名非彼域名)，后面接一个冒号，紧接着一个查询表达式。例如：查询title域中包含关键词elasticsearch的文档，查询表达式如下：

```title:elasticsearch```

​	也可以把多个查询表达式用于一个域中。例如：查询title域中含关键词elasticsearch并且含短语“mastering book”的文档，查询表达式如下：

```title:(+elasticsearch +"mastering book")```

​	当然，也可以换一种写法，作用是一样的：

```+title:elasticsearch +title:"mastering book")```

​	另外，Lucene支持模糊查询(fuzzy query)和邻近查询(proximity query)。语法规则是查询表达式后面接一个~号，后面紧跟一个整数。如果查询表达式是单独一个Term，这表示我们的搜索关键词可以由Term变形（替换一个字符，添加一个字符，删除一个字符）而来，即与Term是相似的。这种搜索方式称为模糊搜索(fuzzy query)。在~符号后面的整数表示最大编辑距离。例如：执行查询表达式“writer~2”能够搜索到含writer和writers的文档。

​	当~符号用于一个短语时，~后面的整数表示短语中可接收的最大的词编辑距离（短语中替换一个词，添加一个词，删除一个词）。举个例子，查询表达式```title:"mastering elasticsearch"```只能匹配title域中含"mastering elasticsearch"的文档，而无法匹配含"mastering book elasticsearch"的文档。但是如果查询表达式变成```title:"mastering elasticsearch"~2```，那么两种文档就都能够成功匹配了。

​	另外，我们还可以使用加权（boosting）机制来改变关键词的重要程度。加权机制的语法是一个^符号后面接一个浮点数表示权重。如果权重小于1，就会降低关键词的重要程度。同理，如果权重大于1就会增加关键词的重要程度。默认的加权值为1。

​	除了上述的功能外，Lucene还支持区间查询（range scarching），其语法是用中括号或者}表示区间。例如：如果我们查询一个数值域（numeric field），可以用如下查询表达式：

```price:[10.00 TO 15.00]```

​	这条查询表达式能查询到price域的值在10.00到15.00之间的所有文档。

​	对于string类型的field，区间查询也同样适用。例如：

```name:[Adam TO Adria]```

​	这条查询表达式能查询到name域中含关键词Adam到关键词Adria之间关键词（字符串升序，且闭区间）的文档。

​	如果希望区间的边界值不会被搜索到，那么就需要用大括号替换原来的中括号。例如，查询price域中价格在10.00(10.00要能够被搜索到)到15.00(15.00不能被搜索到)之间的文档，就需要用如下的查询表达式：

```price:[10.00 TO 15.00}```



#### 处理特殊字符

​	如果在搜索关键词中出现了如下字符集合中的任意一个字符，就需要用反斜杠(\\)进行转义。字符集合如下： +, -, &&, || , ! , (,) , { } , [ ] , ^, " , ~, *, ?, : , \, / 。例如，查询关键词 abc"efg 就需要转义成 abc\"efg。






请注意出于性能考虑，默认的通配符不能是关键词的首字母。

![img](https://doc.yonyoucloud.com/doc/mastering-elasticsearch/notes/rm.png

此外，Lucene支持模糊查询(fuzzy query)和邻近查询(proximity query)。语法规则是查询表达式后面接一个~符号，后面紧跟一个整数。如果查询表达式是单独一个Term，这表示我们的搜索关键词可以由Term变形(替换一个字符，添加一个字符，删除一个字符)而来，即与Term是相似的。这种搜索方式称为模糊搜索(fuzzy search)。在~符号后面的整数表示最大编辑距离。例如：执行查询表达式 "writer~2"能够搜索到含writer和writers的文档。

当~符号用于一个短语时，~后面的整数表示短语中可接收的最大的词编辑距离(短语中替换一个词，添加一个词，删除一个词)。举个例子,查询表达式title:"mastering elasticsearch"只能匹配title域中含"mastering elasticsearch"的文档，而无法匹配含"mastering book elasticsearch"的文档。但是如果查询表达式变成title:"mastering elasticsearch"~2,那么两种文档就都能够成功匹配了。

此外，我们还可以使用加权(boosting)机制来改变关键词的重要程度。加权机制的语法是一个^符号后面接一个浮点数表示权重。如果权重小于1，就会降低关键词的重要程度。同理，如果权重大于1就会增加关键词的重要程度。默认的加权值为1。可以参考 第2章 活用用户查询语言 的 Lucene默认打分规则详解 章节部分的内容来了解更多关于加权(boosting)是如何影响打分排序的。

除了上述的功能外，Lucene还支持区间查询(range searching),其语法是用中括号或者}表示区间。例如：如果我们查询一个数值域(numeric field)，可以用如下查询表达式：

