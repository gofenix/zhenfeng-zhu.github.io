---
title: FaaS3
publish_date: 2023-01-07
---

# 如何用Deno+区块链打造一个去中心化的FaaS平台

# 什么是Web3应用架构

![](https://raw.githubusercontent.com/zhenfeng-zhu/pic-go/main/202301072214479.png)

大多数的web3应用都遵循了如下的架构：

- 简单应用（纯链上数据且交互并不复杂），例如：uniswap以及纯链上的NFT项目
- 前端与web2应用没有区别
- 无后端
- 区块链作为数据库

# Deno

众所周知，v8是Chrome内部的JavaScript执行引擎，它优异的JIT能力，以及高效的垃圾回收，使得Chrome成为最快最成功的浏览器。v8仅仅被用在浏览器中有些暴殄天物，于是十多年前（2009），Ryan Dahl把v8引入了服务端，创建了nodejs。node以简单容易上手的编程模型（单线程、异步处理）一举成为了广受欢迎的服务端开发工具。

![](https://raw.githubusercontent.com/zhenfeng-zhu/pic-go/main/202301072215848.png)

ry在几年后，自我革命，重新用v8打造deno，意欲将deno成为下一代开发的王者。Deno的功能亮点包括：

- 默认安全。外部代码没有文件系统、网络、环境的访问权限，除非显式开启。
- 支持开箱即用的 TypeScript 的环境。
- 只分发一个独立的可执行文件（deno）。
- 有着内建的工具箱，比如一个依赖信息查看器（deno info）和一个代码格式化工具（deno fmt）。
- 有一组经过审计的 标准模块，保证能在 Deno 上工作。
- 脚本代码能被打包为一个单独的 JavaScript 文件。

# 沙箱

我认为可能是 deno 相对于 node 做出的最重要的架构上的重塑，就是security。v8 倾尽全力打造了一个安全的沙箱，node 却只关心其 javascript 解释器，而在现在，服务器的世界就进入了一个沙箱（VM / container / wasm）横行的时代。

![](https://raw.githubusercontent.com/zhenfeng-zhu/pic-go/main/202301072215245.png)

deno 看上去像是一个服务端的 chrome。它用 isolate (隔离) 隔离用户的代码，并可以在极短的时间内加载并运行几乎不可能进行任何恶意行为的用户代码（如果权限控制得当）。

# 去中心化http import

在使用deno的时候，我们不用再依赖NPM，也不需要package.json。每个包

都是从一个URL加载。

在node中，如果我们要使用一个软件包，必须先从NPM安装它：

```jsx
npm i moment
```

等它安装完毕后，才能在程序中使用：

```jsx
const moment  = require("moment")
```

这个是相当的中心化，

不管是谁要在本地运行你的 NodeJS 存储库，都必须从 NPM 安装所有依赖项。而web，本来就支持http import，去中心化的，npm管理反而是后来开发的。

![](https://raw.githubusercontent.com/zhenfeng-zhu/pic-go/main/202301072216928.png)

通过http import，我们可以在一个小的函数中，发挥更大的威力，大展宏图，不用在陷入npm install带来的node_modules黑洞。

# 下一代web框架fresh

Fresh 由 Deno 作者出品，在最近发布了 1.0 的正式版本，宣布支持了生产环境，并且在 Github 上热度也比较高。

![](https://raw.githubusercontent.com/zhenfeng-zhu/pic-go/main/202301072216727.png)

首先，Fresh 基于 Deno 运行时，由 Deno 原班人马开发，享有 Deno 一系列工具链和生态的优势，比如内置的[测试工具](https://www.zhihu.com/search?q=%E6%B5%8B%E8%AF%95%E5%B7%A5%E5%85%B7&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A%222638750513%22%7D)、支持 http import 等等。

其次是渲染性能方面，Fresh 整体采用 Islands 架构(之前介绍的 Astro 也是类似)，实现了客户端按需 Hydration，有一定的渲染性能优势。

当然，还有一个比较出色的点是构建层做到了 Bundle-less，即应用代码不需要打包即可直接部署上线，后文会介绍这部分的具体实现。

# 开始干活

在选定技术栈之后，就开始干活。

## 动态导入

从本质上来说，就是加载一个代码片段执行并获取结果。有点儿类似动态语言中的eval函数。

我们都知道，在js中，如果要导入一个函数，一般用import语句。比如：

```jsx
import {sayHi, sayBye} from './say.js'
```

这种导入语句称之为“静态”导入，语法非常简单且严格。

首先，我们不能动态生成import的任何参数，模块的路径也必须是原始类型的字符串，不能是函数调用，类似下面的import是行不通的：

```jsx
import ... from getModuleName()
```

其次，我们也无法根据条件或者运行时导入：

```jsx
if(...) {
	import ...
}else{
	import ...
}
```

那么，我们如何才能动态的按需导入模块呢？这个时候，就有import()表达式。

我们可以在代码中的任意位置动态地使用它。例如：