---
title: python算法-树的遍历和堆排序
date: 2019-11-23 14:43:18
tags: 算法
categories: python
---

### 二叉树的遍历

- 遍历：迭代所有元素一遍
- 树的遍历：对树中所有元素不重复地访问一遍，也称作扫描
- 广度优先遍历
  - 层序遍历
- 深度优先遍历
  - 前序遍历
  - 中序遍历
  - 后序遍历
- 遍历序列：将树中所有元素遍历一遍后，得到的元素的序列。将层次结构转换成了线性结构。
- 层序遍历
  - 按照树的层次，从第一层开始，自左向右遍历元素
  - 遍历序列
    - ABCDEFGHI

![](/images/python二叉树遍历和堆排序/二叉树遍历1.png)

- 深度优先遍历
  - 设树的根结点为D，左子树为L，右子树为R，且要求L一定在R之前，则有下面几种遍历方式：
  - 前序遍历，也叫先序遍历或先根遍历，DLR
  - 中序遍历，也叫中根遍历，LDR
  - 后序遍历，也叫后根遍历，LRD
- 前序遍历DLR
  - 从根结点开始，先左子树后右子树
  - 每个子树内部依然是先根结点，再左子树后右子树。递归遍历
  - 遍历序列
    - A BDGH CEIF

![](/images/python二叉树遍历和堆排序/前序遍历1.png)

- 中序遍历LDR
  - 从根结点的左子树开始遍历，然后是根结点，再右子树
  - 每个子树内部，也是先左子树，后根结点，再右子树。递归遍历
  - 遍历序列
    - 图1
      - GDHB A IECF
    - 图2
      - GDHB A EICF

![](/images/python二叉树遍历和堆排序/中序遍历1.png)

![](/images/python二叉树遍历和堆排序/中序遍历2.png)

- 后序遍历LRD
  - 先左子树，后右子树，再根结点
  - 每个子树内部依然是先左子树，后右子树，再根结点。递归遍历
  - 遍历序列
    - GHDB IEFC A

![](/images/python二叉树遍历和堆排序/后序遍历1.png)



### 堆排序 Heap Sort

- 堆 Heap
  - 堆是一个完全二叉树
  - 每个非叶子结点都要大于或者等于其左右孩子结点的值称为大顶堆
  - 每个非叶子结点都要小于或者等于其左右孩子结点的值称为小顶堆
  - 根结点一定是大顶堆中的最大值，一定是小顶堆中的最小值
- 大顶堆
  - 完全二叉树的每个非叶子结点都要大于或者等于其左右孩子结点的值称为大顶堆
  - 根结点一定是大顶堆中的最大值

![](/images/python二叉树遍历和堆排序/堆排序大顶堆1.png)

- 小顶堆
  - 完全二叉树的每个叶子结点都要小于或者等于其左右孩子结点的值称为小顶堆
  - 根结点一定是小顶堆中的最小值

![](/images/python二叉树遍历和堆排序/堆排序小顶堆1.png)

- 1、构建完全二叉树
  - 待排序数字为30,20,80,40,50,10,60,70,90
  - 构建一个完全二叉树存放数据，并根据性质5对元素编号，放入顺序的数据结构中
  - 性质5
    - 如果有一棵n个结点的完全二叉树(深度为性质4)，结点按照层序编号
    - 如果i=1，则结点i是二叉树的根，无双新；如果i>1，则其双亲是int(i/2)，向下取整。就是子结点的编号整除2得到的就是父结点的编号。父结点如果是i，那么左孩子结点就是2i，右孩子结点就是2i+1
    - 如果2i>n，则结点i无左孩子，即结点i为叶子结点；否则其左孩子结点存在编号为2i
    - 如果2i+1>n，则结点i无右孩子，注意这里并不能说明结点i没有左孩子；否则右孩子结点存在编号为2i+1
  - 构造一个列表为[0,30,20,80,40,50,10,60,70,90]，层序遍历

![](/images/python二叉树遍历和堆排序/堆排序构建完全二叉树1.png)

- 2、构建大顶堆--核心算法
  - 度数为2的结点A，如果它的左右孩子结点的最大值比它大的，将这个最大值和该结点***交换***
  - 度数为1的结点A，如果它的左孩子的值大于它，则***交换***
  - 如果结点A被交换到新的位置，还需要和其孩子结点重复上面的过程
  - 调整完，索引要减1，这又是一个单结点算法的问题。当索引为1时，这时在根结点，如果根结点被调整了，那么它下面的节点也都要跟着调整

![](/images/python二叉树遍历和堆排序/堆排序构建完全二叉树2.png)

- 2、构建大顶堆--起点结点的选择
  - 从完全二叉树的最后一个结点（最后一个结点指最下一层最右边的结点）的双亲结点开始，即最后一层的最右边叶子结点的父结点开始。下图中的90对应的就是n，40的节点就是n//2
  - 结点数为n，则起始结点的编号为n//2(性质5)

![](/images/python二叉树遍历和堆排序/堆排序构建完全二叉树3.png)

- 2、构建大顶堆--下一个结点的选择
  - 从起始结点开始向左找其同层结点，到头后再从上一层的最右边结点开始继续向左逐个查找，直至根结点

![](/images/python二叉树遍历和堆排序/堆排序构建完全二叉树4.png)

- 2、大顶堆的目标
  - 确保每个结点的都比左右结点的值大，大顶堆的排序每次可能都是不一样的，所以是不稳定的

![](/images/python二叉树遍历和堆排序/堆排序构建完全二叉树5.png)

- 3、排序
  - 将大顶堆根结点这个最大值和最后一个叶子结点交换，那么最后一个叶子结点就是最大值，将最后一个叶子结点排除在待排序结点之外
  - 从根结点开始（新的根结点），重新调整为大顶堆后，重复上一步。调整完之后，堆顶一定是一个最大值或最小值

![](/images/python二叉树遍历和堆排序/堆排序构建完全二叉树6.png)

- 3、排序
  - 堆顶和最后一个结点交换，并排除最后一个结点

![](/images/python二叉树遍历和堆排序/堆排序排序7.png)

![](/images/python二叉树遍历和堆排序/堆排序排序8.png)

![](/images/python二叉树遍历和堆排序/堆排序排序9.png)

![](/images/python二叉树遍历和堆排序/堆排序排序10.png)

![](/images/python二叉树遍历和堆排序/堆排序排序11.png)

- 算法实现

```python
# 堆排序
## 辅助代码，让每次挪动数字后，都打印出现在的二叉树状况，帮助判断挪动是否正确。有一个树，打印下面的样子
### origin = [30,20.80,40,50,10,60,70,90] 数据存在列表中，打印成下面的样子
#          30
#    20          80
#  40   50    10     60
#70  90
# 打印要求，严格对齐，就像一棵二叉树一样
# 思路
# 第一行取1个打印，第二行取2个，第三行取3个，以此类推。如何对齐且不重叠？
# 两种方法，第一种为同学实现，第二个是老师实现
import math

# 居中对齐方案
def print_tree(array,unit_width=2):   # array是二叉树的列表，unit_width是单位宽度，默认是2
    length = len(array)  # 9。结点总量
    depth = math.ceil(math.log2(length + 1))  # 树深度4。深度要加1，因为在调用时列表前面没有补0
# math.ceil是对数字向上取整，无论如何都会向上取，如3.01，也会取4。math.log2返回 x 以2为底的对数。这
# 通常比 log(x, 2) 更准确。指数是幂运算aⁿ(a≠0)中的一个参数，a为底数，n为指数，指数位于底数的右上角，
# 幂运算表示指数个底数相乘。对数是对求幂的逆运算，正如除法是乘法的倒数，反之亦然。 这意味着一个数字的对
# 数是必须产生另一个固定数字（基数）的指数。 
    
    index = 0
    
    width = 2 ** depth - 1   # 行宽，最宽的行 15。
    for i in range(depth):   # 0 1 2 3
        for j in range(2 ** i):   # i=0时，j=0；i=1时，j=0,1；2:0,1,2,3 3:0~7
  # 这层循环可以控制要打印数字的个数
            # 居中打印，后面追加一个空格
            print('{:^{}}'.format(array[index],width * unit_width),end=' ' * unit_width)
# {:^{}}最外层的大括号是要打印的内容，里面的小括号是整个的长度，^表示居中。也是就要打印的内容在多长的长
# 度内居中对齐
# 第一次进入这里时array[0]是1，width宽度是15，之后也一直是15。这条语句在第一次执行是就是把array[0]
# 这个值放在宽度是15的行中，居中对齐，然后不换行，因为用了end=' '。这样第一行就完了，接着将index向右
# 移一个，这时index就是2了，之后判断，如果index大于length，就终止，因为完全二叉树有可能不是满的，不是
# 满的就提前终止。这个for循环在第一次打印了一个元素就结束了，最后打印了一个回车换行。第二次进入这里时，
# 因为width变成了之前的一半，也就是7，所以这里会打印两次，第一段的宽度是7，并将array[index]的值居中对
# 齐。再向下一层时，会分为4段再居中对齐。之后以此类推
            index += 1
            if index >= length:
                break
        width = width // 2   # 居中打印宽度减半
        print()   # 控制换行
# 测试
print_tree([x + 1 for x in range(29)])

=======================================================================================
import math

# 投影栅格实现
def print_tree(array):
    '''
    		前空格			元素间隔
    1		  7				0（这里可以不当特例解决，用15）
    2		  3				7
    3		  1				3
    4		  0				1
第一行中间间隔0个，第二行7个，第三行3个，第四行1个。用总的层次加1，减去层级的数字，再平方，最后减1，就是前空格的数字。如(4 + 1 - 1) ** 2 - 1 = 7，这就是第一层的前空格数
    '''
 
    index = 1   # 索引从1开始
    depth = math.ceil(math.log2(len(array)))   # 深度公式，根据性质得出的，还是4层
# 因为调用array列表时前面补0了，不然应该是math.ceil(math.log2(len(array)+1))。
# 如下面的print_tree([0,30,20,80,40,50,10,60,70,90,22])，这就是在列表前补0了
	sep = '  '   # 每个栅格占的宽度，缺的元素用这个补
    for i in range(depth):   # 按层次依次进入
        offset = 2 ** i   # 偏移量，为了计算本次要打印的数字使用
        print(sep * (2 ** (depth - i - 1) - 1),end='')
# 先打印数字前面的空格
# 2 ** (depth - i - 1) - 1)是为了得到间隔的空格数，如第一次这里计算的结果就是
# 2**(4-0-1)-1=2**3-1=7，再乘以sep，这就是前面的空格数。打印完前面的空格数后，不可以换行，所以用了
# end=''。之后就打印数据与数据间的间隔空格
        line = array[index:index + offset]  # 1:2, 2:4, 4:8, 8:16
# 第一次这里是array[1:2]，值是1，这样就可以取出第一个元素了，因为在调用时会在列表前补0，所以这里从索引 
# 1开始取值。之后因为起点变了，所以index也会变。line是当前取出了几个元素。取出的就是一行的元素数，之后
# 迭代这一行的所有元素并打印，还有分隔符
        for j,x in enumerate(line):
            print("{:>{}}".format(x,len(sep)),end='')
# 这里打印前面空格后的数字。这里的x对应外面的大括号，len(sep)对应里面的小括号
            interval = 0 if i == 0 else 2 ** (depth - i) - 1
# 计算数字与数字之间的空格。i=0是第一行时的情况，i是深度计数，这里是为了计算宽度的，也就是计算0,7,3,1
# 的。另外两个数字中间的空格要比最开始的空格多一倍加1，如前面的空格是3，两个数字中间的空格就要是3*2+1=7个 
            if j < len(line) - 1:  # 打印到最后一个元素，后面的空格就不用打了
# 判断是否是最后一个数字，如len(line)是2的时候，这时j是0或1，那么当j是1的时候，这里就是1 < 1，不成
# 立，就不会打印空格了，否则打印下面的空格，也就是数字与数字之间的空格
                print(sep * interval,end='')
# 这个判断是为了计算数字与数字之间的空格的
        index += offset   
# 这就是index每次要调整的步长，加上偏移量就可以了，这是为了每次打印完，都要调整index的指钍指向的位置 
        print()
        
print_tree([0,30,20,80,40,50,10,60,70,90,22])
print_tree([0,30,20,80,40,50,10,60,70,90,22,33,44,55,66,77])
print_tree([0,30,20,80,40,50,10,60,70,90,22,33,44,55,66,77,88,99,11])
=======================================================================================
# 堆调整
# 核心算法
# 对于堆排序的核心算法就是堆结点的调整
# 1. 度数为2的结点A，如果它的左右孩子结点的最大值比它大的，将这个最大值和该结点交换
# 2. 度数为1的结点A，如果它的左孩子的值大于它，则交换。也就是说结点有两个孩子或只有左孩子，不可能只有右孩子
# 3. 如果结点A被交换到新的位置，还需要和其孩子结点重复上面的过程

# 这里定义了三个函数，第一个函数是保证第个小的节点中，大数在父节点，小数为子节点。第二个函数是循环第一 
# 个函数，保证排序后是一个大顶堆。第三个函数是对大顶堆做排序，也就是用根节点与最后一个叶子节点交换，之后
# 排除交换后的根节点，再使用第一个函数构建好大顶堆，再进行交换。因为使用第二个函数构建好大顶堆后，就保证
# 了最大的数字在最上方，第二层一定有一个次大的数字，所以第二次使用第一个函数就可以构建大顶堆了
# Heap Sort，下面是在一个小的节点中，保证大的数字在父节点，小数在子节点上
# 为了和编码对应，增加一个无用的0在首位
# origin = [0,50,10,90,30,70,40,80,60,20]
origin = [0,30,20,80,40,50,10,60,70,90]

total = len(origin) - 1   # 初始待排序元素个数，即n
print(origin)
print_tree(origin)

def heap_adjust(n,i,array:list):   # array:list是参数注解
    '''
    调整当前结点（核心算法）
    
    调整的结点的起点在n//2，可以保证所有调整的结点都有孩子结点
    :param n: 待比较数个数，从max_heap传入的total值，不会变化。n就是边界，n就是节点的数量，就是上面
    		  total的值
    :param i: 当前结点的下标，i是当前父节点的索引号，i的值是从max_heap函数传入的变化的值
    :param array: 待排序数据
    :return: None，是否return无所谓，因为要调整的是从外面传进来的，所以可以不return或return array
    '''
    while 2 * i <= n:   # 假设只有左子树
        # 孩子结点判断 2i为左孩子，2i+1为右孩子，i是父结点的索引，i是4，左孩子是8，右孩子是9
        lchild_index = 2 * i   # 设置左子树索引
        # 先假定左孩子是最大索引，因为不知道是否有右孩子，如果存在右孩子且大则最大孩子索引就是右孩子
        max_child_index = lchile_index   # n=2i
        if n > lchild_index and array[lchild_index + 1] > array[lchild_index]:   
# n>2i说明还有右孩子，因为n=2i时存在左孩子。n大于左孩子索引且右孩子的值一定要大于左孩子的值，就把最大索引改为右孩子
        	max_child_index = lchild_index + 1   # n=2i+1
        
        # 和子树的根结点比较
        if array[max_child_index] > array[i]:   # 和父结点的值比较，大于父结点时才交换
            array[i],array[max_child_index] = array[max_child_index],array[i]
            i = max_child_index   
# 被交换后，需要判断是否还需要调整。这里是为了再回到上面的while循环，看交换以后，看交换的节点下是否有子
# 节点比它大。当2*i>n时或父节点是最大时，就不会再进入这个循环了
        else:
            break
        # print_tree(array)
        
heap_adjust(total,total//2, origin)
print(origin)
print_tree(origin)
# 到目前为止也只是解决了单个结点的调整，下面要使用循环来依次解决比起始结点编号小的结点。

# 构建大顶堆
# 起始的选择
# 从最下层最右边叶子结点的父结点开始，由于构造了一个前置的0，所以编号和列表的索引正好重合。但是，元素个数等于长度减1

# 下一个结点
# 按照二叉树性质5编号的结点，从起点开始找编号逐个递减的结点，直到编号1
# 构建大顶堆、大根堆
def max_heap(total,array:list):
    for i in range(total//2,0,-1):
# 从total//2开始，从公式得出，i是父节点的索引号，2i是左子树，2i+1是右子树，总的节点数量整除2就是最下
# 面的一个父节点的索引。这里total会按倒序依次减少
        heap_adjust(total,i,array)
# 使用第一个函数构建出大顶堆，因为total是不断减小的，所以会把每个小的节点都排列一次，从最下面的一个小节
# 点开始排序一直到最上面的小节点
    return array
# 这里返回的array是给下面的print_tree()使用的，不然下面就不能加print_tree()，因为返回的是None，所
# 以会报错:print_tree函数中不能对None类型使用len()函数。返回这里应该返回一个列表类型
print_tree(max_heap(total,origin))

# 思考：
#          90
#    70          80
#  40   50    10     60
#20  30

# 大顶堆有没有可能是这样
#          90
#    60          80
#  40   50    10     70
#20  30

# 有没有可能这样
#          90
#    50          80
#  40   10    60     70
#20  30

# 有没有可能这样
#          90
#    50          70
#  40   10    60     80
#20  30
# 不可以是这样，70下有80，比70大，上面几种是有可能的，所以是不稳定的

# 结论
# 最大的一定在第一层，第二层一定有一个次大的，也就是80

# 排序
# 思路：
# 1. 每次都要让堆顶的元素和最后一个结点交换，然后排除最后一个元素，形成一个新的被破坏的堆
# 2. 让它重新调整，调整后，堆顶一定是最大的元素
# 3. 再次重复第1、2步直至剩余一个元素
def sort(total,array:list):
# 这里开始对大顶堆排序
    while total > 1:
# 当total大于1时进入循环，也就是元素的数量大于1时进行循环
        array[1],array[total] = array[total],array[1]   # 堆顶和最后一个结点交换
        total -= 1   # 待比较的元素减1
        
        heap_adjust(total,1,array)   # 重新构建大顶堆
    return array

print_tree(sort(total,origin))

# 改进
# 如果最后剩余2个元素的时候，如果后一个结点比堆顶大，就不用调整了
def sort(total,array:list):
    while total > 1:
        array[1],array[total] = array[total],array[1]   # 堆顶和最后一个结点交换
        total -= 1
        if total == 2 and array[total] >= array[total-1]:
            break
# 当只剩最后两个元素时，如果最后一个元素大于其前面的元素，就退出循环。因为上面的交换过程最后也是要达到
# array[total],array[1]的结果，也就是把大数放在前面小数放在后面
        heap_adjust(total,1,array)
    return array

print_tree(sort(total,origin))

# 思考
# 如果有n个结点全部是90，能在哪些地方优化？是否可以假设，如果在某一个趟排序中，如果最后一个叶子结点正好
# 是堆顶，就代表树中元素都相等？
# 反例
#     90
#   80  90

# 完整代码
# 如果有需要，请自行将算法函数封装成类
import math

def print_tree(array):
    '''
        		前空格			元素间
    1		  7				0
    2		  3				7
    3		  1				3
    4		  0				1
    '''
    index = 1
    depth = math.ceil(math.log2(len(array)))   
    # 因为补0了，不然应该是math.ceil(math.log2(len(array)+1))
    sep = '  '
    for i in range(depth):
        offset = 2 ** i
        print(sep * (2 ** (depth - i -1) - 1),end='')
        line = array[index:index + offset]
        for j,x in enumerate(line):
            print("{:{}}".format(x,len(sep)),end='')
            interval = 0 if i == 0 else 2 ** (depth - i) - 1
            if j < len(line) - 1:
                print(sep * interval,end='')
                
        index += offset
        print()
        
# Heap Sort

# 为了和编码对应，增加一个无用的0在首位
# origin = [0,50,10,90,30,70,40,80,60,20]
origin = [0,50,10,90,30,70,40,80,60,20]

total = len(origin) - 1   # 初始待排序元素个数，即n
print(origin)
print_tree(origin)
print("="*50)

def heap_adjust(n,i,array:list):
    '''
    调整当前结点（核心算法）
    
    调整的结点的起点在n//2，保证所有调整的结点都有孩子结点
    :param n:待比较数个数
    :param i: 当前结点的下标
    :param array: 待排序数据
    :return: None
    '''
    while 2 * i <= n:
        # 孩子结点判断2i为左孩子，2i+1为右孩子
        lchile_index = 2 * i
        max_child_index = lchile_index   # n=2i
        if n > lchile_index and array[lchile_index + 1] > array[lchile_index]:
            # n > 2i说明还有右孩子
            max_child_index = lchile_index + 1   # n=2i+1
            
        # 和子树的根结点比较
        if array[max_child_index] > array[i]:
            array[i],array[max_child_index] = array[max_child_index],array[i]
            i = max_child_index   # 被交换后，需要判断是否还需要调整
            
        else:
            break
     # print_tree(array)
    
# 构建大顶椎、大根堆
def max_heap(total,array:list):
    for i in range(total//2,0,-1):
        heap_adjust(total,i,array)
    return array

print_tree(max_heap(total,origin))
print("="*50)

# 排序
def sort(total,array:list):
    while total > 1:
        print(origin)
        print_tree(origin)
        array[1],array[total] = array[total],array[1]   # 堆顶和最后一个结点交换
        print(origin)
        print_tree(origin)
        print('='*80)
        total -= 1   # 每次堆顶与最后一个索引值交换后，就要减一个元素
        if total == 2 and array[total] >= array[total-1]:
            break
        heap_adjust(total,1,array)   # 这里传入的节点索引固定为1，也就是重新从上面开始构建大顶堆
    return array

print_tree(sort(total,origin))
print(origin)
```

- 总结
  - 是利用堆性质的一种选择排序，在堆顶选出最大值或最小值
  - 时间复杂度
    - 堆排序的时间复杂度为O(nlogn)
    - 由于堆排序对原始记录的排序状态并不敏感，因此它无论是最好、最坏和平均时间复杂度均为O(nlogn)。与树相关的都会有一个logn，但还达不到，所以是nlogn。因为是二叉树，所以是以2为底

![](/images/python二叉树遍历和堆排序/总结1.png)

- 总结
  - 空间复杂度
    - 只是使用了一个交换用的空间，空间复杂度为O(1)
  - 稳定性
    - 不稳定的排序算法