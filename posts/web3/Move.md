---
title: Sui Move合约案例分享和源码解析
publish_date: 2023-01-08
---

[toc]

# 课程目标

主要介绍几个 sui 的合约案例和源码解析。

# 简单介绍一下 sui 和 move

Move 诞生于 2018 年 Libra 项目初期。多年来，许多人为 Move 的设计和实现做出了贡献，因为该语言从一个关键思想演变为一种与平台无关的智能合约语言，其大胆的目标是成为"Web3 JavaScript"。

## sui

Sui 是由 Mysten Labs 团队开发的高性能公链，目标是建设安全、高效、大规模使用的智能合约平台，完善的 web3 基础设施，Sui 主要相比于其他区块链有以下特点：

1. 区分了简单交易和复杂交易，采用不同的共识机制，实行大规模并行计算。
2. 采用“面向资源”的 Sui Move 语言，提供更具备安全性和可组合性的区块链编程语言。

Aptos 和 Sui 都采用了 Move 这一语言，不过，具体使用的模型略有不同。Aptos 使用 Diem 团队创建的 Core Move 语言，而 Sui 正在利用他们自己的替代版本，称为“Sui Move”，对象是 Sui Move 中最基础的概念，像组织数据，某款 NFT、某个代币的余额、某项智能合约，这些都是不同的对象。

这意味着 Sui 链上的交易可以根据对象的不同可以来分组处理。使得大规模并行计算成为可能。下图是一个简单的例子，描述了可分为 3 组的 5 笔不同交易。这 3 组交易完全可以实现并行处理。

![](https://raw.githubusercontent.com/zhenfeng-zhu/pic-go/main/202301101000459.png)

# 环境准备

1. Rust

2. Sui

```bash
# install sui
cargo install --locked --force  --git https://github.com/MystenLabs/sui.git --branch devnet sui
```

3. Move Analyzer

```bash
# install move-analyzer
cargo install --git https://github.com/move-language/move move-analyzer --locked --force
```

4. 编辑器：[vscode](https://code.visualstudio.com/)

5. 插件：[move-analyzer](https://marketplace.visualstudio.com/items?itemName=move.move-analyzer) 和 [Move syntax](https://marketplace.visualstudio.com/items?itemName=damirka.move-syntax)

# object

sui move 最大的特点就是 object。

快速入门：

- 什么是面向对象

我们知道，面向对象的编程有三大特性：封装、继承和多态。

面向对象编程是一种具有对象概念的程序编程范型，同时也是一种程序开发的抽象方针，它可能包含数据、属性、代码与方法。对象则指的是类的实例。它将对象作为程序的基本单元，将程序和数据封装其中，以提高软件的可重用性、灵活性和可扩展性，对象里的程序可以访问及修改对象相关联的数据。在面向对象编程里，计算机程序会被设计成彼此相关的对象。

我们来看 sui 是怎么应用这种编程思想的：

> 在 Sui 中，存储的基本单位是对象。与其他许多区块链的存储以账户为中心，每个账户都包含一个键值存储不同，Sui 的存储是以对象为中心的。一个智能合约就是一个对象（称为 Move Package）。

我们来看一个样例：

```rust
module basics::object_basics {
    use sui::event;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    struct Object has key, store {
        id: UID,
        value: u64,
    }

    struct Wrapper has key {
        id: UID,
        o: Object
    }

    struct NewValueEvent has copy, drop {
        new_value: u64
    }

    public entry fun create(value: u64, recipient: address, ctx: &mut TxContext) {
        transfer::transfer(
            Object { id: object::new(ctx), value },
            recipient
        )
    }

    public entry fun transfer(o: Object, recipient: address) {
        transfer::transfer(o, recipient)
    }

    public entry fun freeze_object(o: Object) {
        transfer::freeze_object(o)
    }

    public entry fun set_value(o: &mut Object, value: u64) {
        o.value = value;
    }

    // test that reading o2 and updating o1 works
    public entry fun update(o1: &mut Object, o2: &Object) {
        o1.value = o2.value;
        // emit an event so the world can see the new value
        event::emit(NewValueEvent { new_value: o2.value })
    }

    public entry fun delete(o: Object) {
        let Object { id, value: _ } = o;
        object::delete(id);
    }

    public entry fun wrap(o: Object, ctx: &mut TxContext) {
        transfer::transfer(Wrapper { id: object::new(ctx), o }, tx_context::sender(ctx))
    }

    public entry fun unwrap(w: Wrapper, ctx: &mut TxContext) {
        let Wrapper { id, o } = w;
        object::delete(id);
        transfer::transfer(o, tx_context::sender(ctx))
    }
}
```

# ft

# nft

# sui move 工程化示例：multi packages

# tic toe

安装好 sui

初始化创世区块

```
sui genesis --force
```

启动 sui

```
sui start
```

由于游戏需要 3 个账号，我们看下自己有多少个

```
sui addresses
```

如果不够 3 个的话，需要手动创建一些

```
sui client new-address ed25519
```

然后再看下：

```
$ sui client addresses
Showing 3 results.
0x4e08311c5ab41519182d9d171a1a7141d7653d88
0x6c8c722e08d1a1d896594edd2d4748e43eaf3a1c
0xa5915281c83f87266dd3eb46bbd03468eeb4f16e
```

给这三个一下：

```
export ADMIN=0x4e08311c5ab41519182d9d171a1a7141d7653d88
export PLAYER_X=0x6c8c722e08d1a1d896594edd2d4748e43eaf3a1c
export PLAYER_O=0xa5915281c83f87266dd3eb46bbd03468eeb4f16e
```

然后发布的时候，可以看下：

```
sui client publish --gas-budget 3000
INCLUDING DEPENDENCY MoveStdlib
INCLUDING DEPENDENCY Sui
BUILDING Games
[warn] Client/Server api version mismatch, client api version : 0.20.0, server api version : 0.20.1
Cannot find gas coin for signer address [0x4e08311c5ab41519182d9d171a1a7141d7653d88] with amount sufficient for the budget [3000].
```

报失败的话，拿着这个地址，去 discord 上申请测试币。

![](https://raw.githubusercontent.com/zhenfeng-zhu/pic-go/main/202301082251225.png)

如果报 gas 不足的话，就增加 gas 的预算。

```
$ sui client publish --gas-budget 5000
INCLUDING DEPENDENCY MoveStdlib
INCLUDING DEPENDENCY Sui
BUILDING Games
[warn] Client/Server api version mismatch, client api version : 0.20.0, server api version : 0.20.1
----- Certificate ----
Transaction Hash: D8WkoQt6StS9ZPFJpNkUqMUx5L5YUB7NH7rjAnqifW1q
Transaction Signature: AA==@J26OncJYU9tfkBjfgoxbMR3RAVONLnnTkmPoj4uNNX2vEuZUClON+lkOejqJZ2MC4eL3/T4BUI0ewBVBI+GmAA==@YSkiAxvMhUVWjVy+w4aPmHjieRPuwI5NmsCR/3ceLBw=
Signed Authorities Bitmap: RoaringBitmap<[0, 1, 3]>
Transaction Kind : Publish
----- Transaction Effects ----
Status : Success
Created Objects:
  - ID: 0x7450261e72f90d0ff7b9920fd9a9951eddca1a77 , Owner: Account Address ( 0x4e08311c5ab41519182d9d171a1a7141d7653d88 )
  - ID: 0xc98a4ea4ca5d1d2060e652337abd95df6f8f646c , Owner: Immutable
  - ID: 0xcd79f86f247eb80cf687c77c5b171d70687bc729 , Owner: Account Address ( 0x4e08311c5ab41519182d9d171a1a7141d7653d88 )
  - ID: 0xdafd19fd9fc418aaa72069b3b914769fbc25923f , Owner: Immutable
Mutated Objects:
  - ID: 0x0dc54c8cadc0132fb29f3a682dbc36de2ea4c28b , Owner: Account Address ( 0x4e08311c5ab41519182d9d171a1a7141d7653d88 )
```

然后就可以部署使用了。

# move 设计模式

# 参考

## sandwich

https://learnblockchain.cn/article/5251
