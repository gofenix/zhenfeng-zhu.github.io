---
title: FaaS3 快速入门
publish_date: 2023-01-26
---

# 介绍

FaaS 是一个专为 web3 开发人员提供的 Serverless 工具。

它有如下特点：

- 所有代码都是存储在区块链上
- 开发者拥有代码的主权
- Typescript 优先，可快速上手

# 安装

前置需要安装 rust 环境。

```bash
$ cargo install --force --locked --git https://github.com/faas3/faas3-cli.git faas3
```

安装完毕之后，可以执行如下命令进行测试：

```bash
$ faas3 --help
Usage: faas3 [COMMAND]

Commands:
  create  create the function
  deploy  deploy the function to runtime and blockchain
  run     local run
  call    remote call the function
  list    list the functions
  verify  verify the runtime function, which should equal to the on-chain code
  help    Print this message or the help of the given subcommand(s)

Options:
  -h, --help     Print help
  -V, --version  Print version
```

# 创建一个函数

```bash
$ faas3 create dao-example
$ cd dao-example
```

# 在里面编写自己的逻辑

比如，cowsay 函数：

```ts

```

# 部署函数

在项目目录下面执行 deploy 命令：

```bash
$ faas3 deploy
```

# 测试调用

```bash
$ faas3 call dao-example
```

# 通过 http 访问

> 注意：目前仅支持 post 方法

```bash
$ curl
```

# 验证函数

为了加速函数的执行速度，降低冷启动时间，我们在 runtime 中缓存了一份链上函数。

我们可以验证在 runtime 中的函数是否和链上的代码一致：

```bash
$ faas3 verify dao-example
```

# 卸载

```bash
$ cargo uninstall faas3
```
