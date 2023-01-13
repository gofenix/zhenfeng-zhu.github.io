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

```rust
struct Color {
    red: u8,
    green: u8,
    blue: u8,
}
```

这个结构体定义了一个 Color 的数据结构。然而，这样的 struct 还不是 sui 对象。

```rust
use sui::object::UID;

struct ColorObject has key {
    id: UID,
    red: u8,
    green: u8,
    blue: u8,
}
```

1. key
2. 第一个字段是`id: UID`
   UID 是 sui 内部类型，一般不需要直接和它打交道。在 Sui 中，任意一个 UI 的值都是独特的。

我们来看一个具体的例子：

```rust
module tutorial::color_object {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    struct ColorObject has key {
        id: UID,
        red: u8,
        green: u8,
        blue: u8,
    }

    // == Functions covered in Chapter 1 ==

    fun new(red: u8, green: u8, blue: u8, ctx: &mut TxContext): ColorObject {
        ColorObject {
            id: object::new(ctx),
            red,
            green,
            blue,
        }
    }

    public entry fun create(red: u8, green: u8, blue: u8, ctx: &mut TxContext) {
        let color_object = new(red, green, blue, ctx);
        transfer::transfer(color_object, tx_context::sender(ctx))
    }

    public fun get_color(self: &ColorObject): (u8, u8, u8) {
        (self.red, self.green, self.blue)
    }

    // == Functions covered in Chapter 2 ==

    /// Copies the values of `from_object` into `into_object`.
    public entry fun copy_into(from_object: &ColorObject, into_object: &mut ColorObject) {
        into_object.red = from_object.red;
        into_object.green = from_object.green;
        into_object.blue = from_object.blue;
    }

    public entry fun delete(object: ColorObject) {
        let ColorObject { id, red: _, green: _, blue: _ } = object;
        object::delete(id);
    }

    public entry fun transfer(object: ColorObject, recipient: address) {
        transfer::transfer(object, recipient)
    }

    // == Functions covered in Chapter 3 ==

    public entry fun freeze_object(object: ColorObject) {
        transfer::freeze_object(object)
    }

    public entry fun create_immutable(red: u8, green: u8, blue: u8, ctx: &mut TxContext) {
        let color_object = new(red, green, blue, ctx);
        transfer::freeze_object(color_object)
    }

    public entry fun update(
        object: &mut ColorObject,
        red: u8, green: u8, blue: u8,
    ) {
        object.red = red;
        object.green = green;
        object.blue = blue;
    }
}

#[test_only]
module tutorial::color_objectTests {
    use sui::test_scenario;
    use tutorial::color_object::{Self, ColorObject};
    use sui::object;
    use sui::transfer;
    use sui::tx_context;

    // == Tests covered in Chapter 1 ==

    #[test]
    fun test_create() {
        let owner = @0x1;
        // Create a ColorObject and transfer it to @owner.
        let scenario_val = test_scenario::begin(owner);
        let scenario = &mut scenario_val;
        {
            let ctx = test_scenario::ctx(scenario);
            color_object::create(255, 0, 255, ctx);
        };
        // Check that @not_owner does not own the just-created ColorObject.
        let not_owner = @0x2;
        test_scenario::next_tx(scenario, not_owner);
        {
            assert!(!test_scenario::has_most_recent_for_sender<ColorObject>(scenario), 0);
        };
        // Check that @owner indeed owns the just-created ColorObject.
        // Also checks the value fields of the object.
        test_scenario::next_tx(scenario, owner);
        {
            let object = test_scenario::take_from_sender<ColorObject>(scenario);
            let (red, green, blue) = color_object::get_color(&object);
            assert!(red == 255 && green == 0 && blue == 255, 0);
            test_scenario::return_to_sender(scenario, object);
        };
        test_scenario::end(scenario_val);
    }

    // == Tests covered in Chapter 2 ==

    #[test]
    fun test_copy_into() {
        let owner = @0x1;
        let scenario_val = test_scenario::begin(owner);
        let scenario = &mut scenario_val;
        // Create two ColorObjects owned by `owner`, and obtain their IDs.
        let (id1, id2) = {
            let ctx = test_scenario::ctx(scenario);
            color_object::create(255, 255, 255, ctx);
            let id1 =
                object::id_from_address(tx_context::last_created_object_id(ctx));
            color_object::create(0, 0, 0, ctx);
            let id2 =
                object::id_from_address(tx_context::last_created_object_id(ctx));
            (id1, id2)
        };
        test_scenario::next_tx(scenario, owner);
        {
            let obj1 = test_scenario::take_from_sender_by_id<ColorObject>(scenario, id1);
            let obj2 = test_scenario::take_from_sender_by_id<ColorObject>(scenario, id2);
            let (red, green, blue) = color_object::get_color(&obj1);
            assert!(red == 255 && green == 255 && blue == 255, 0);

            color_object::copy_into(&obj2, &mut obj1);
            test_scenario::return_to_sender(scenario, obj1);
            test_scenario::return_to_sender(scenario, obj2);
        };
        test_scenario::next_tx(scenario, owner);
        {
            let obj1 = test_scenario::take_from_sender_by_id<ColorObject>(scenario, id1);
            let (red, green, blue) = color_object::get_color(&obj1);
            assert!(red == 0 && green == 0 && blue == 0, 0);
            test_scenario::return_to_sender(scenario, obj1);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_delete() {
        let owner = @0x1;
        // Create a ColorObject and transfer it to @owner.
        let scenario_val = test_scenario::begin(owner);
        let scenario = &mut scenario_val;
        {
            let ctx = test_scenario::ctx(scenario);
            color_object::create(255, 0, 255, ctx);
        };
        // Delete the ColorObject we just created.
        test_scenario::next_tx(scenario, owner);
        {
            let object = test_scenario::take_from_sender<ColorObject>(scenario);
            color_object::delete(object);
        };
        // Verify that the object was indeed deleted.
        test_scenario::next_tx(scenario, owner);
        {
            assert!(!test_scenario::has_most_recent_for_sender<ColorObject>(scenario), 0);
        };
        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_transfer() {
        let owner = @0x1;
        // Create a ColorObject and transfer it to @owner.
        let scenario_val = test_scenario::begin(owner);
        let scenario = &mut scenario_val;
        {
            let ctx = test_scenario::ctx(scenario);
            color_object::create(255, 0, 255, ctx);
        };
        // Transfer the object to recipient.
        let recipient = @0x2;
        test_scenario::next_tx(scenario, owner);
        {
            let object = test_scenario::take_from_sender<ColorObject>(scenario);
            transfer::transfer(object, recipient);
        };
        // Check that owner no longer owns the object.
        test_scenario::next_tx(scenario, owner);
        {
            assert!(!test_scenario::has_most_recent_for_sender<ColorObject>(scenario), 0);
        };
        // Check that recipient now owns the object.
        test_scenario::next_tx(scenario, recipient);
        {
            assert!(test_scenario::has_most_recent_for_sender<ColorObject>(scenario), 0);
        };
        test_scenario::end(scenario_val);
    }

    // == Tests covered in Chapter 3 ==

    #[test]
    fun test_immutable() {
        let sender1 = @0x1;
        let scenario_val = test_scenario::begin(sender1);
        let scenario = &mut scenario_val;
        {
            let ctx = test_scenario::ctx(scenario);
            color_object::create_immutable(255, 0, 255, ctx);
        };
        test_scenario::next_tx(scenario, sender1);
        {
            // take_owned does not work for immutable objects.
            assert!(!test_scenario::has_most_recent_for_sender<ColorObject>(scenario), 0);
        };
        // Any sender can work.
        let sender2 = @0x2;
        test_scenario::next_tx(scenario, sender2);
        {
            let object_val = test_scenario::take_immutable<ColorObject>(scenario);
            let object = &object_val;
            let (red, green, blue) = color_object::get_color(object);
            assert!(red == 255 && green == 0 && blue == 255, 0);
            test_scenario::return_immutable(object_val);
        };
        test_scenario::end(scenario_val);
    }
}

```

## **创建 Sui 对象**

```rust
use sui::object;
use sui::tx_context::TxContext;

fun new(red: u8, green: u8, blue: u8, ctx: &mut TxContext): ColorObject {
    ColorObject {
        id: object::new(ctx),
        red,
        green,
        blue,
    }
}
```

1. 我们必须给每个字段分配一个初始值，这里就是 red，green，blue 等作为传入参数。
2. ctx，是我们交易的上下文，是一个从入口函数传下来的参数。
3. object::new，是给 Sui 对象创建 UID 的方法。

## 存储 Sui 对象

在上面的 new 函数，可以认为是一个构造函数。我们可以把这个对象放在持久的全局存储中。最关键的 API 就是 transfer 函数：

```rust
public fun transfer<T: key>(obj: T, recipient: address)
```

在 Sui 中，每个对象都必须有一个所有者，可以是一个地址，也可以是另一个对象。

这个 transfer 函数另一个常见的用途，就是把对象转移给交易的发送者，比如把自己的 NFT 转给别人。比如，下面这个函数：

```rust
use sui::transfer;

// This is an entry function that can be called directly by a Transaction.
public entry fun create(red: u8, green: u8, blue: u8, ctx: &mut TxContext) {
    let color_object = new(red, green, blue, ctx);
    transfer::transfer(color_object, tx_context::sender(ctx))
}
```

其实，就是创建一个 color 对象，然后把这个对象让这个交易的发送者持有。

当然，我们也可以给 ColorObjec 添加一个 getter 方法，这样其他模块就可以读取到。

```rust
public fun get_color(self: &ColorObject): (u8, u8, u8) {
    (self.red, self.green, self.blue)
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
