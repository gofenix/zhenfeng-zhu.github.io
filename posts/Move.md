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

1. move

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

# 基础知识

## Move.toml

在 sui move package 中，都会有一个 `Move.toml` 文件。

```toml
[package]
name = "basics"
version = "0.0.1"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework", rev = "devnet" }

[addresses]
basics =  "0x0"
```

- `[package]`：主要是一些元信息。比如 name 和版本号等。
- `[dependencies]`：指定这个项目的一些依赖。
- `[addresses]`：地址的别名

## init 函数

init 函数是一个特殊的函数，当相关模块被发布的时候，只会被执行一次。

而且这个函数的名字也必须 init，且参数也是唯一的 ctx，比如：

```move
fun init(ctx: &mut TxContext) { /* ... */ }
```

## entry 函数

entry 是一个函数的修饰符，用来表示这个函数是可以被交易直接调用。

```move
module examples::object {
    use sui::transfer;
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;

    struct Object has key {
        id: UID
    }

    public fun create(ctx: &mut TxContext): Object {
        Object { id: object::new(ctx) }
    }

    entry fun create_and_transfer(to: address, ctx: &mut TxContext) {
        transfer::transfer(create(ctx), to)
    }
}
```

比如，上面是有两个函数：

- create，是一个 public 类型的，任何一个模块都可以调用它。
- create_and_transfer，是一个 entry 函数，entry 函数不能有返回值，而且这个函数是在交易中被直接调用。

## 字符串

move 本身是没有 string 类型的，sui 这里提供了一个很好用的封装。

比如：

```move
module examples::strings {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;

    use std::string::{Self, String};

    /// A dummy Object that holds a String type
    struct Name has key, store {
        id: UID,

        /// Here it is - the String type
        name: String
    }

    /// Create a name Object by passing raw bytes
    public fun issue_name_nft(
        name_bytes: vector<u8>, ctx: &mut TxContext
    ): Name {
        Name {
            id: object::new(ctx),
            name: string::utf8(name_bytes)
        }
    }
}

```

这些字符串是一个 utf 编码的。

## 共享对象

在 move 中，一般对象都是有所有者的。我们也可以将一个对象，变成共享对象，这样任何人都可以访问到这个对象。

```move
        transfer::share_object(DonutShop {
            id: object::new(ctx),
            price: 1000,
            balance: balance::zero()
        })
```

通过 share_object 方法就可以将一个对象变成 shared_object。

## transfer

被 key 和 store 修饰的对象，可以用 transfer::transfer 函数自由的转移。

在原生的 move 中，转账或者说所有权的转让，是一个比较复杂的方式，我们需要 borrow，也需要用包装器模式的方式去构建一个 table 表。

```move

struct CoolAssetStore has key {
  assets: Table<TokenId, CoolAsset>
 }public fun opt_in(addr: &signer) {
  move_to(addr, CoolAssetHolder { assets: table::new() }
 }public entry fun cool_transfer(
  addr: &signer, recipient: address, id: TokenId
 )acquires CoolAssetStore {
  // withdraw
  let sender = signer::address_of(addr);
  assert!(exists<CoolAssetStore>(sender), ETokenStoreNotPublished);
  let sender_assets = &mut borrow_global_mut<CoolAssetStore (sender).assets;
  assert!(table::contains(sender_assets, id), ETokenNotFound);
   let asset = table::remove(&sender_assets, id);
  // check that 30 days have elapsed
  assert!(time::today() > asset.creation_date + 30, ECantTransferYet)
   // deposit
   assert!(exists<CoolAssetStore>(recipient), ETokenStoreNotPublished);
  let recipient_assets = &mut borrow_global_mut<CoolAssetStore>
 (recipient).assets;
  assert!(table::contains(recipient_assets, id), ETokenIdAlreadyUsed);
  table::add(recipient_assets, asset)
}
```

代码相当复杂，但是如果是 sui move，有了 transfer 函数之后，我们就能让代码简洁很多。

```move

public entry fun cool_transfer(
 asset: CoolAsset, recipient: address, ctx: &mut TxContext
) {
 assert!(tx_context::epoch(ctx) > asset.creation_date + 30, ECantTransferYet);
 transfer(asset, recipient)
}
```

这两个函数实现的功能都是一样的，大家可以仔细品一下。

## 事件

这个和 solidity 类似。

solidity 需要首先声明事件，然后再释放它。

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
```

```solidity
    // 定义_transfer函数，执行转账逻辑
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) external {

        _balances[from] = 10000000; // 给转账地址一些初始代币

        _balances[from] -=  amount; // from地址减去转账数量
        _balances[to] += amount; // to地址加上转账数量

        // 释放事件
        emit Transfer(from, to, amount);
    }
```

每次用\_transfer()函数进行转账操作的时候，都会释放 Transfer 事件，并记录相应的变量。

我们来看看在 move 中，是怎么用的:

1. 引人 event 包

```move
use sui::event;
```

2. 定义事件的数据结构

```move
    struct DonutBought has copy, drop {
        id: ID
    }
```

3. 在函数中释放事件

```move
    /// Buy a donut.
    public entry fun buy_donut(
        shop: &mut DonutShop, payment: &mut Coin<SUI>, ctx: &mut TxContext
    ) {
        assert!(coin::value(payment) >= shop.price, ENotEnough);

        let coin_balance = coin::balance_mut(payment);
        let paid = balance::split(coin_balance, shop.price);
        let id = object::new(ctx);

        balance::join(&mut shop.balance, paid);

        // Emit the event using future object's ID.
        event::emit(DonutBought { id: object::uid_to_inner(&id) });
        transfer::transfer(Donut { id }, tx_context::sender(ctx))
    }
```

## one time witness

OTW，是一个特殊的实例，保证在在整个系统中都是独一无二的。需要满足如下的条件：

1. 只在模块初始化时创建，即仅能在 init 函数中创建。
2. 必须是大写的
3. 不能被手动打包
4. 具有 drop 能力

```move
/// Example of spawning an OTW.
module examples::my_otw {
    use std::string;
    use sui::tx_context::TxContext;
    use examples::one_time_witness_registry as registry;

    /// Type is named after the module but uppercased
    struct MY_OTW has drop {}

    /// To get it, use the first argument of the module initializer.
    /// It is a full instance and not a reference type.
    fun init(witness: MY_OTW, ctx: &mut TxContext) {
        registry::add_record(
            witness, // here it goes
            string::utf8(b"My awesome record"),
            ctx
        )
    }
}
```

# Move 设计模式

首先我们来看，为什么 Move 会有设计模式。

1. 面向资源编程

Move 是一种新的编程语言，其特点是面向资源编程，对于区块链最核心的 Token 资产进行了更为贴合的处理，实现了真正意义上的数字资产化。

2. 状态存储机制

在 Solidity 中，能够定义并保存自己的状态变量，变量的值放在全局储存上，在合约中可以直接通过全局变量直接读取或者修改它。

```solidity
// A solidity examply
// set msg.sender to owner
contract A {
    // 定义一个状态变量
    address owner;
    function setOwner() public {
	// 通过变量名直接修改
        owner = msg.sender;
    }
}
```

但是在 Move 中存储方式是完全不一样的，Move 合约并不直接存储资源，代码中的每一个变量都是一个资源对象，是资源对象那么必须通过显示的接口去明确的调用。

3. 能力

是 Move 语言中的一种类型特性，用于控制对给定类型的值允许哪些操作。

    - copy: 允许此类型的值被复制
    - drop:  允许此类型的值被弹出/丢弃，没有话表示必须在函数结束之前将这个值销毁或者转移出去。
    - store: 允许此类型的值存在于全局存储中或者某个结构体中
    - key: 允许此类型作为全局存储中的键(具有 key 能力的类型才能保存到全局存储中)

## 能力

Capability 是一个能够证明资源所有者特定权限的资源（注意：它是一个资源也就是一个 Move 中的结构体），其作用主要是用来进行访问控制。

例如当我们想限制某个资源的铸造权，管理权，函数调用权时，便可以采用 Capability 这种设计模式。这也是 Move 智能合约里面使用最广泛的一个设计模式，例如 sui-framework 中的 TreasuryCap。这是也是已知最古老的 Move 设计模式，可追溯到 Libra 项目及其代币智能合约，其中功能用于授权铸币。

Capability 本质是一个资源对象，只是被可信任的用户持有。通常在合约中我们可以定义一个 AdminCap 来代表本模块的控制权限，如果某个用户持有就可以用户可信，其中资源对象内不需要任何的字段。

```move
struct AdminCap has key, store {}
```

一般 Capability 生成在模块初始化的时候，例如 Sui 中的 init 函数，就可以赋予部署者一个 Capability 的资源，然后通过 move_to 然后储存到它的账户下。

然后当需要使用到有访问权限的函数时，此时函数就会检查调用者地址下是否存在这个 Capability 资源，如果存在那么说明调用者拥有正确的访问权限。

sui 封装了全局操作函数，所以在实现上和 aptos 有些不同，我们先看下 sui 是怎么做的。

```move
module capability::m {
    use sui::transfer;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};

    struct OwnerCapability has key { id: UID }

    /// A Coin Type
    struct Coin has key, store {
        id: UID,
        value: u64
    }

    /// Module initializer is called once on module publish.
    /// Here we create only one instance of `OwnerCapability` and send it to the publisher.
    fun init(ctx: &mut TxContext) {
        transfer::transfer(OwnerCapability {
            id: object::new(ctx)
        }, tx_context::sender(ctx))
    }

    /// The entry function can not be called if `OwnerCapability` is not passed as
    /// the first argument. Hence only owner of the `OwnerCapability` can perform
    /// this action.
    public entry fun mint_and_transfer(
        _: &OwnerCapability, to: address, ctx: &mut TxContext
    ) {
        transfer::transfer(Coin {
            id: object::new(ctx),
            value: 100,
        }, to)
    }
}
```

相较于其他语言的访问控制（例如 Solidity 中定一个 address owner 即可，或者定义一个 mapping），Move 中的访问控制实现上是复杂的，主要由于 Move 中独特的存储架构，模组不存储状态变量，需要将资源存储到一个账户下面。

## witness

witness 是一种临时资源，相关资源只能被使用一次，资源在使用后被丢弃，确保不能重复使用相同的资源来初始化任何其他结构，通常用来确认一个类型的的所有权。

witness 得益于 Move 中的类型系统。一个类型实例化的时候，它只能在定义这个类型的模块中创建。

witness 在 Sui 中与其他 Move 公链有一些区别。

如果结构类型与定义它的模块名称相同且是大写，并且没有字段或者只有一个布尔字段，则意味着它是一个 one-time witness 类型。该类型只会在模块初始化时使用，在合约中验证是否是 one-time witness 类型，可以通过 sui framework 中 types::is_one_time_witness 来验证。

例如在 sui 的 coin 库中，如果需要注册一个 coin 类型，那么需要调用 create_currency 函数。函数参数则就需要一个 one-time witness 类型。为了传递该类型参数，需要在模块初始化 init 函数参数中第一个位置传递，即：

我们在上面讲过，这里不再赘述。

## hot potato

一个没有任何能力的结构体，而且强制该结构在创建它的模块中使用掉，这样的结构被称之为 Hot potato。

```move
struct Hot_Potato {}
```

这种模式在闪电贷款这样的需要原子性的程序中是理想的，因为在同一交易中必须启动和偿还贷款。

当函数返回了一个不具有任何的 ability 的 potato 时，由于没有 drop 的 ability 也，所以没办法储存到全局里面去，也没有办法去储存到其他结构体中。在函数结束的时也不能丢弃，所以必须解构这个资源，或者传给另外一个可以使用这个 potato 的一个函数。

所以通过这个方式，可以来实现函数的调用流程。模块可以在没有调用者任何背景和条件下，保证调用者一定会按照预先设定的顺序去调用函数。

而闪电贷本质也是一个调用顺序的问题。

我们来看下 Sui 是怎么实现闪电贷的。

当用户借款时调用 loan 函数返回一笔资金 coin 和一个记录着借贷金额 value 但没有任何 ability 的 receipt 收据，如果用户试图不归还资金，那么这个收据将被丢弃从而报错，所以必须调用 repay 函数从而销毁收据。收据的销毁完全由模块控制，销毁时验证传入的金额是否等于收据中的金额，从而保证闪电贷的逻辑正确。

```move
module example::flash_lender {
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /// A shared object offering flash loans to any buyer willing to pay `fee`.
    struct FlashLender<phantom T> has key {
        id: UID,
        /// Coins available to be lent to prospective borrowers
        to_lend: Balance<T>,
        /// Number of `Coin<T>`'s that will be charged for the loan.
        /// In practice, this would probably be a percentage, but
        /// we use a flat fee here for simplicity.
        fee: u64,
    }

    /// A "hot potato" struct recording the number of `Coin<T>`'s that
    /// were borrowed. Because this struct does not have the `key` or
    /// `store` ability, it cannot be transferred or otherwise placed in
    /// persistent storage. Because it does not have the `drop` ability,
    /// it cannot be discarded. Thus, the only way to get rid of this
    /// struct is to call `repay` sometime during the transaction that created it,
    /// which is exactly what we want from a flash loan.
    struct Receipt<phantom T> {
        /// ID of the flash lender object the debt holder borrowed from
        flash_lender_id: ID,
        /// Total amount of funds the borrower must repay: amount borrowed + the fee
        repay_amount: u64
    }

    /// An object conveying the privilege to withdraw funds from and deposit funds to the
    /// `FlashLender` instance with ID `flash_lender_id`. Initially granted to the creator
    /// of the `FlashLender`, and only one `AdminCap` per lender exists.
    struct AdminCap has key, store {
        id: UID,
        flash_lender_id: ID,
    }

    // === Creating a flash lender ===

    /// Create a shared `FlashLender` object that makes `to_lend` available for borrowing.
    /// Any borrower will need to repay the borrowed amount and `fee` by the end of the
    /// current transaction.
    public fun new<T>(to_lend: Balance<T>, fee: u64, ctx: &mut TxContext): AdminCap {
        let id = object::new(ctx);
        let flash_lender_id = object::uid_to_inner(&id);
        let flash_lender = FlashLender { id, to_lend, fee };
        // make the `FlashLender` a shared object so anyone can request loans
        transfer::share_object(flash_lender);

        // give the creator admin permissions
        AdminCap { id: object::new(ctx), flash_lender_id }
    }

    // === Core functionality: requesting a loan and repaying it ===

    /// Request a loan of `amount` from `lender`. The returned `Receipt<T>` "hot potato" ensures
    /// that the borrower will call `repay(lender, ...)` later on in this tx.
    /// Aborts if `amount` is greater that the amount that `lender` has available for lending.
    public fun loan<T>(
        self: &mut FlashLender<T>, amount: u64, ctx: &mut TxContext
    ): (Coin<T>, Receipt<T>) {
        let to_lend = &mut self.to_lend;
        assert!(balance::value(to_lend) >= amount, ELoanTooLarge);
        let loan = coin::take(to_lend, amount, ctx);
        let repay_amount = amount + self.fee;
        let receipt = Receipt { flash_lender_id: object::id(self), repay_amount };

        (loan, receipt)
    }

    /// Repay the loan recorded by `receipt` to `lender` with `payment`.
    /// Aborts if the repayment amount is incorrect or `lender` is not the `FlashLender`
    /// that issued the original loan.
    public fun repay<T>(self: &mut FlashLender<T>, payment: Coin<T>, receipt: Receipt<T>) {
        let Receipt { flash_lender_id, repay_amount } = receipt;
        assert!(object::id(self) == flash_lender_id, ERepayToWrongLender);
        assert!(coin::value(&payment) == repay_amount, EInvalidRepaymentAmount);

        coin::put(&mut self.to_lend, payment)
    }
}
```

Hot Potato 设计模式不仅仅只适用于闪电贷的场景，还可以用来控制更复杂的函数调用顺序。

例如我们想要一个制作土豆的合约，当用户调用 get_potato 时，会得到一个没有任何能力的 potato，我们想要用户得倒之后，按照切土豆、煮土豆最后才能吃土豆的一个既定流程来操作。所以用户为了完成交易那么必须最后调用 consume_potato，但是该函数限制了土豆必须被 cut 和 cook，所以需要分别调用 cut_potato 和 cook_potato，cook_potato 中又限制了必须先被 cut，从而合约保证了调用顺序必须为 get→cut→cook→consume，从而控制了调用顺序。

```move
module example::hot_potato {
    /// Without any capability,
    struct Potato {
        has_cut: bool,
        has_cook: bool,
    }
    /// When calling this function, the `sender` will receive a `Potato` object.
    /// The `sender` can do nothing with the `Potato` such as store, drop,
    /// or move_to the global storage, except passing it to `consume_potato` function.
    public fun get_potato(_sender: &signer): Potato {
        Potato {
            has_cut: false,
            has_cook: false,
        }
    }

    public fun cut_potatoes(potato: &mut Potato) {
        assert!(!potato.has_cut, 0);
        potato.has_cut = true;
    }

    public fun cook_potato(potato: &mut Potato) {
        assert!(!potato.has_cook && potato.has_cut, 0);
        potato.has_cook = true;
    }

    public fun consume_potato(_sender: &signer, potato: Potato) {
        assert!(potato.has_cook && potato.has_cut, 0);
        let Potato {has_cut: _, has_cook: _ } = potato; // destroy the Potato.
    }
}
```



# object

sui move 最大的特点就是 object。

快速入门：

- 什么是面向对象

我们知道，面向对象的编程有三大特性：封装、继承和多态。

面向对象编程是一种具有对象概念的程序编程范型，同时也是一种程序开发的抽象方针，它可能包含数据、属性、代码与方法。对象则指的是类的实例。它将对象作为程序的基本单元，将程序和数据封装其中，以提高软件的可重用性、灵活性和可扩展性，对象里的程序可以访问及修改对象相关联的数据。在面向对象编程里，计算机程序会被设计成彼此相关的对象。

我们来看 sui 是怎么应用这种编程思想的：

> 在 Sui 中，存储的基本单位是对象。与其他许多区块链的存储以账户为中心，每个账户都包含一个键值存储不同，Sui 的存储是以对象为中心的。一个智能合约就是一个对象（称为 Move Package）。

```move
struct Color {
    red: u8,
    green: u8,
    blue: u8,
}
```

这个结构体定义了一个 Color 的数据结构。然而，这样的 struct 还不是 sui 对象。

```move
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

## **创建 Sui 对象**

```move
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

```move
public fun transfer<T: key>(obj: T, recipient: address)
```

在 Sui 中，每个对象都必须有一个所有者，可以是一个地址，也可以是另一个对象。

这个 transfer 函数另一个常见的用途，就是把对象转移给交易的发送者，比如把自己的 NFT 转给别人。比如，下面这个函数：

```move
use sui::transfer;

// This is an entry function that can be called directly by a Transaction.
public entry fun create(red: u8, green: u8, blue: u8, ctx: &mut TxContext) {
    let color_object = new(red, green, blue, ctx);
    transfer::transfer(color_object, tx_context::sender(ctx))
}
```

其实，就是创建一个 color 对象，然后把这个对象让这个交易的发送者持有。

当然，我们也可以给 ColorObject 添加一个 getter 方法，这样其他模块就可以读取到。

```move
public fun get_color(self: &ColorObject): (u8, u8, u8) {
    (self.red, self.green, self.blue)
}
```

## 完整代码和单元测试

```bash
$ sui move new basics
$ cd basics/sources
$ touch color_object.move
```

然后用 vscode 打开项目，输入以下代码：

```move
module basics::color_object {
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
module basics::color_objectTests {
    use sui::test_scenario;
    use basics::color_object::{Self, ColorObject};
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

我们在上面已经介绍过正常的代码结构，然后咱们来看下 sui move 是如何来做单元测试的。

```
use sui::test_scenario;
```

sui 提供了一个 test_scenario 框架，用来做单元测试。begin 函数开启第一个交易，next_tx 函数进行后续的交易。

针对上面这个 ColorObject 合约，我们应该如何测试呢。

首先，先硬编码一个测试地址

```move
let owner = @0x01;
```

然后，用 begin 开始交易，然后就可以调用 create 函数

```move
let owner = @0x1;
// Create a ColorObject and transfer it to @owner.
let scenario_val = test_scenario::begin(owner);
let scenario = &mut scenario_val;
{
    let ctx = test_scenario::ctx(scenario);
    color_object::create(255, 0, 255, ctx);
};
```

接下来就可以校验一下 0x01 是否拥有这个对象，而且其他人也没有拥有这个对象。

```move
let not_owner = @0x2;
// Check that not_owner does not own the just-created ColorObject.
test_scenario::next_tx(scenario, not_owner);
{
    assert!(!test_scenario::has_most_recent_for_sender<ColorObject>(scenario), 0);
};

test_scenario::next_tx(scenario, owner);
{
    let object = test_scenario::take_from_sender<ColorObject>(scenario);
    let (red, green, blue) = color_object::get_color(&object);
    assert!(red == 255 && green == 0 && blue == 255, 0);
    test_scenario::return_to_sender(scenario, object);
};
test_scenario::end(scenario_val);
```

我们来看下完整的代码，然后在项目中就可以执行 sui move test 命令了。

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
