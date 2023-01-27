---
title: FaaS3 实现原理
publish_date: 2023-01-27
---

# 什么是区块链

在学习区块链时，我们可能会发现一些复杂的文章。很容易完全迷失在其中，想要放弃。所以，在这里我想用一种非常简单的方式解释区块链，可能有一些不准确，但旨在帮助大家入门。

> 一句话：区块链是一个开放的、分散的、共享的数据库，任何人都可以公开存储东西。

这是什么意思呢？

1. **开放的**: 任何人都能与区块链交互，这没有限制
2. **去中心化**: 没有人拥有它
3. **数据库**: 你能够在上边存储信息
4. **公开的**: 任何人都能够访问上边的数据

根据这些特性，我们可以随心所欲地与区块链进行交互。很多时候，我们可能想要设置「规则手册」来确定人们如何与区块链的特定部分进行交互，以便它具有一些功能——特别是我们将要定义的应用程序。这些都是通过智能合约完成的。

例如，如果我想制作一个允许用户将他们最喜欢的水果存储在区块链上的应用程序，我需要制作一个智能合约：

1. 有一个所有人都能调用的函数
2. 传入参数（这个人最喜欢的水果）
3. 用一些数据储存那个参数
4. 将更新的数据发送到区块链（自动触发）

如果我创建了这个智能合约并将其「部署」到区块链上，那么任何人都可以将他们最喜欢的水果放在区块链上，它会永远存在！除非我们也有删除该数据的函数。

智能合约有如下的优点：

1. **速度，效率和确定性**: 智能合约速度很快，而且没有中间人。也不需要文件审批。如果我想通过使用允许我调用某些函数的智能合约来更新区块链上的数据，不需要得到我父母或银行的批准就可以做到。
2. **可信和透明**: 如果我们这样做，区块链以及智能合约将非常安全。几乎不可能破解或改变区块链的状态，虽然这是由于很多种原因，但主要是因为智能合约。如果智能合约不允许我做某事，我根本做不到。没有办法解决它。

那么有哪些缺点呢？

1. **很难做对**: 虽然只能合约非常酷，但它不是智能的。它们需要开发人员方面的高级专业知识，确保它们没有安全问题，它们是低级的，并且可以按照我们的意愿去做。稍后我们将了解所有这些。
2. **如果开发人员做坏，它们可能是恶意的**: 如果开发人员想要制作一个智能合约来窃取您的资金，然后诱使您调用执行此操作的函数，那么您的资金将被窃取。在区块链的世界中，您必须确保与安全的智能合约进行交互。
3. **无法撤销**: 你无法撤销一些事，除非你有一个函数允许你这样做。

在区块链世界中，最为大家所熟悉的是比特币和以太坊。对于开发者而言，以太坊是毫无疑问的 No.1 开发平台，Solidity 是以太坊智能合约的编程语言，经过几年的发展，成为了事实上的标准。

而公链和智能合约的战场远未结束，涌现了一批以太坊的竞争者，如 Solana，Near 等。还有最近火爆的 Move 双子星公链：Aptos 和 Sui。

# Deno

v8 是 Chrome 内部的 JavaScript 执行引擎，它优异的 JIT
能力，以及高效的垃圾回收，使得 Chrome 成为最快最成功的浏览器。v8
仅仅被用在浏览器中有些暴殄天物，于是十多年前（2009），Ryan Dahl 把 v8 引入了服务端，创建了 nodejs。node 以简单容易上手的编程模型（单线程、异步处理）一举成为了广受欢迎的服务端开发工具。

![](https://raw.githubusercontent.com/zhenfeng-zhu/pic-go/main/202301072215848.png)

ry 在几年后，自我革命，重新用 v8 打造 deno，意欲将 deno
成为下一代开发的王者。Deno 的功能亮点包括：

- 默认安全。外部代码没有文件系统、网络、环境的访问权限，除非显式开启。
- 支持开箱即用的 TypeScript 的环境。
- 只分发一个独立的可执行文件（deno）。
- 有着内建的工具箱，比如一个依赖信息查看器（deno
  info）和一个代码格式化工具（deno fmt）。
- 有一组经过审计的标准模块，保证能在 Deno 上工作。
- 脚本代码能被打包为一个单独的 JavaScript 文件。

deno 看上去像是一个服务端的 chrome。它用 isolate (隔离)
隔离用户的代码，并可以在极短的时间内加载并运行几乎不可能进行任何恶意行为的用户代码（如果权限控制得当）。

deno 另一个创新点，就是我们不再依赖 NPM，也不需要 package.json。每个包都是从 url 中加载，这个就是去中心化。

# Deno + 区块链 = ？

假如，我们把 Deno 和区块链结合在一起，会产生什么样的火花呢？

假如我们把代码存储到链上，需要使用的时候，直接从链上加载下来执行，这个不就是新型的 FaaS 平台了么。

一个 Micro FaaS 平台，且是一个基于区跨链的 FaaS 平台，它应该具备什么功能呢？

1. 首先，也是最重要的，需要有一个智能合约。 这个合约的主要功能就是将代码 NFT 化并存到链上。
2. 第二，我们需要一个 Runtime。负责从链上读取合约并执行代码。
3. 第三，我们需要一个命令行工具，负责生成函数模板并部署到链上。
4. 最后，我们需要一个 landing page，用来向外界展示这个作品。

# FaaS3 Move 合约

经过多方比较，最终选择了 Sui Move 作为合约层的实现。

Move 诞生于 2018 年 Libra 项目初期。多年来，许多人为 Move 的设计和实现做出了贡献，其大胆的目标是成为"Web3 JavaScript"。

Sui 是由 Mysten Labs 团队开发的高性能公链，目标是建设安全、高效、大规模使用的智能合约平台，完善的 web3 基础设施，Sui 主要相比于其他区块链有以下特点：

1. 区分了简单交易和复杂交易，采用不同的共识机制，实行大规模并行计算。
2. Sui move 提供更具备安全性和可组合性的区块链编程语言。

Sui move 最大的特点就是 object。

> 在 Sui 中，存储的基本单位是对象。与其他许多区块链的存储以账户为中心，每个账户都包含一个键值存储不同，Sui 的存储是以对象为中心的。一个智能合约就是一个对象（称为 Move Package）。

同时，在 Sui 中，everything is an NFT。Sui 的对象是独特的，非同质化的，而且是有所有权的。

具体来看代码：

```rust
struct FaaSNFT has key, store {
    id: UID,

    name: String,
    description: String,
    url: Url,
    content: String,
}
```

在这里，定义了一个名叫 FaaSNFT 的对象。

- id，是标识 Sui 对象的一个标志，是全局唯一的。
- name，是函数的名字
- description：是函数的一些描述
- content：存储的具体的代码。

之后，提供了一个 mint 函数，供 faas-cli 进行调用，mint 一个 nft，并保存到所有者的账户下面。

```rust
public entry fun mint(
    name: vector<u8>,
    description: vector<u8>,
    url: vector<u8>,
    content: vector<u8>,
    ctx: &mut TxContext
) {
    let nft = FaaSNFT {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            url: url::new_unsafe_from_bytes(url),
            content: string::utf8(content),
    };

    let sender = tx_context::sender(ctx);
    event::emit(NFTMinted {
            object_id: object::id(&nft),
            creator: sender,
            name: nft.name,
    });
    transfer::transfer(nft, sender);
    }
```

我们将这个代码 publish 到 Sui 的 Devnet 上即可。

```bash
$ sui client publish --gas-budget 3000
UPDATING GIT DEPENDENCY https://github.com/MystenLabs/sui.git
INCLUDING DEPENDENCY MoveStdlib
INCLUDING DEPENDENCY Sui
BUILDING faas3
[warn] Client/Server api version mismatch, client api version : 0.22.0, server api version : 0.23.0
----- Certificate ----
Transaction Hash: Fwxn8WZsktkFDTCp4qMTNgCx1PVjGX7C76QA23JXrMeS
Transaction Signature: AA==@t/0I8Ksyg380G5wOHigUm5L/SO0e4ykC81ylWQoYemDWoo6z9OyL1EupDg/qzU8cqOepT9zg0ZuUYuxhtrNMCA==@iDY2dtFvPBD3l88gWoS//QmCw77KilYPiYO8WyxJA2s=
Signed Authorities Bitmap: RoaringBitmap<[0, 2, 3]>
Transaction Kind : Publish
Sender: 0x5d547ccd49f6f35fc0dd66fb76e032e8fbf570ff
Gas Payment: Object ID: 0x2096725dd3d73a6f18497de3ad4777827b12deb4, version: 0xc4, digest: 0x6fa6f839b06ed7d5a10f2b219ef78c5ff0154d840b66fbc7317e8f835acd53a8
Gas Price: 1
Gas Budget: 3000
----- Transaction Effects ----
Status : Success
Created Objects:
  - ID: 0x8ea46c0da1d02a0138e513342f07accac01d44a1 , Owner: Immutable
Mutated Objects:
  - ID: 0x2096725dd3d73a6f18497de3ad4777827b12deb4 , Owner: Account Address ( 0x5d547ccd49f6f35fc0dd66fb76e032e8fbf570ff )
```

这里的 Immutable 的 ObjectId 就是我们部署的合约的 package_id。

# FaaS3 Cli

在有了上一步部署的合约之后，我们就可以 mint 一个 FaaSNFT。这里我选择的是 Sui 的 Rust SDK 来做这件事儿。

需要引入如下的包：

```toml
sui-sdk = { git = "https://github.com/MystenLabs/sui", branch = "devnet" }
sui-keys = { git = "https://github.com/MystenLabs/sui", branch = "devnet" }
sui-types = { git = "https://github.com/MystenLabs/sui", branch = "devnet" }
```

1. 第一步，需要初始化 client。

```rust
let sui = SuiClient::new("https://fullnode.devnet.sui.io:443", None, None).await?;
```

2. 第二步，读取 keystore。

```rust
fn default_keystore_path() -> PathBuf {
    match dirs::home_dir() {
        Some(v) => v.join(".sui").join("sui_config").join("sui.keystore"),
        None => panic!("cannot obtain home directory path"),
    }
}
```

```rust
let keystore_path = default_keystore_path();
let keystore = Keystore::File(FileBasedKeystore::new(&keystore_path)?);
```

3. 第三步，构建 TransactionData

```rust
let mint_call = sui
        .transaction_builder()
        .move_call(
            my_address,
            package_object_id,
            "faas_nft",
            "mint",
            vec![],
            vec![
                SuiJsonValue::from_str(move_func.name.as_str())?,
                SuiJsonValue::from_str(move_func.description.as_str())?,
                SuiJsonValue::from_str("")?,
                SuiJsonValue::from_str(move_func.content.as_str())?,
            ],
            None,
            1000,
        )
        .await?;
```

4. 第四步，签署交易并执行

```rust
let signature = keystore.sign_secure(&my_address, &mint_call, Intent::default())?;
let response = sui
        .quorum_driver()
        .execute_transaction(
            Transaction::from_data(mint_call, Intent::default(), signature).verify()?,
            Some(ExecuteTransactionRequestType::WaitForLocalExecution),
        )
        .await?;
assert!(response.confirmed_local_execution);
```

5. 第五步，解析 response

```rust
let func_id = response
        .effects
        .unwrap()
        .created
        .first()
        .unwrap()
        .reference
        .object_id;
println!("the object id is {:?}", func_id);
```

至此，一个 NFT 就被 mint 出来了，我们可以 Sui explorer 中去查看。

FaaS Cli 的作用不仅仅是和链上交互并 mint nft。它也起到了本地化构建开发的作用。

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

## create 命令

下面我通过 create 命令的实现，带大家看下在 Rust 中是如何优雅的实现命令行工具。

```bash
$ tree
.
├── config.toml
└── main.ts

1 directory, 2 files
```

- config 文件是 FaaS3 项目的一些基础配置。

```toml
[basic]
version = "0.0.1"
name = "dao-demo" # your function name, it's unique.
description = ""
owner = "0x5d547ccd49f6f35fc0dd66fb76e032e8fbf570ff" # Your sui address
```

owner 是你自己的 Sui 地址，必须要确保里面有足够的测试币，不足的话可以去 Discord 中申领。

- main.ts，主要是代码的逻辑

```ts
import * as o from "https://deno.land/x/cowsay/mod.ts";

export async function handler(payload = {}) {
  let m = o.say({
    text: "hello every one",
  });
  console.log(m);
  return m;
}
```

可以通过 http-import 的方式去获取链上的代码，我们可以在 handler 中写具体的代码逻辑。

有了上述的模板，我们就可以在 Rust 中编写命令行工具了。在这里，我使用的是 Clap。

1. 定义命令的 struct

```rust
#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// create the function
    Create {
        /// the function name
        name: String,
    },
    /// deploy the function to runtime and blockchain
    Deploy,
    /// local run
    Run,
    /// remote call the function
    Call {
        /// the function name
        name: String,
    },
    /// list the functions
    List {
        /// the functions of owner
        #[arg(short, long)]
        owner: String,

        /// the funcitons of source, can only be: runtime or chain
        #[arg(short, long)]
        source: String,
    },
    /// verify the runtime function, which should equal to the on-chain code.
    Verify { name: String },
}
```

这里的注释，就是命令的帮助注释。

2. 在 main 函数中解析命令行参数

```rust
let cli = Cli::parse();
match &cli.command {
    Some(Commands::Create { name }) => {
        create_action(name.clone()).await?;
    }
    Some(Commands::Deploy) => {
        deploy_action().await?;
    }
    Some(Commands::Run) => {
        println!("🚧 This command is still WIP!");
    }
    Some(Commands::Call { name }) => {
        call_action(name.clone()).await?;
    }
    Some(Commands::List {
        owner: _,
        source: _,
    }) => {
        println!("🚧 This command is still WIP!");
    }
    Some(Commands::Verify { name }) => {
        verify_action(name.clone()).await?;
        println!("🚧 This command is still WIP!");
    }
    None => {}
}
```

然后，我们就可以编写 create 命令具体的逻辑了

```rust
async fn create_action(name: String) -> Result<(), anyhow::Error> {
    let path = name;
    fs::create_dir(&path)?;
    let conf = format!(
        r#"
[basic]
version = "0.0.1"
name = "{}" # your function name, it's unique.
description = ""
owner = "0x5d547ccd49f6f35fc0dd66fb76e032e8fbf570ff" # Your sui address"#,
        &path
    );
    let conf_file = format!("{}/config.toml", &path);
    fs::write(conf_file, conf.trim_start_matches('\n'))?;

    let tpl = r#"
import * as o from "https://deno.land/x/cowsay/mod.ts"

export async function handler(payload = {}) {
    let m = o.say({
        text: "hello every one",
    })
    console.log(m)
    return m
}
"#;

    let main_file = format!("{}/main.ts", &path);
    fs::write(main_file, tpl.trim_start_matches('\n'))?;

    println!("🎉 Awesome, The [{}] function is created!", path);
    println!("🚑 change the owner to your Sui address!");

    Ok(())
}
```

这段代码的主要功能是：

1. 创建一个文件夹
2. 写入 config.toml 文件
3. 写入 main.ts 文件

有了 Clap 之后，Rust 来写命令行是相当的简洁优雅。

# FaaS Runtime

因为要加载 deno 的代码执行，这里我选择了 Fresh 框架。

Fresh 由 Deno 作者出品，在最近发布了 1.0 的正式版本，宣布支持了生产环境，并且在 Github 上热度也比较高。

![](https://raw.githubusercontent.com/zhenfeng-zhu/pic-go/main/202301072216727.png)

首先，Fresh 基于 Deno 运行时，由 Deno 原班人马开发，享有 Deno
一系列工具链和生态的优势，比如内置的[测试工具](https://www.zhihu.com/search?q=%E6%B5%8B%E8%AF%95%E5%B7%A5%E5%85%B7&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A%222638750513%22%7D)、支持 http import 等等。

其次是渲染性能方面，Fresh 整体采用 Islands 架构(之前介绍的 Astro
也是类似)，实现了客户端按需 Hydration，有一定的渲染性能优势。

当然，还有一个比较出色的点是构建层做到了 Bundle-less，即应用代码不需要打包即可直接部署上线

整体上来看，Fresh 的使用体验和 Nextjs 和相似。利用 fresh 框架的动态路由，我们可以很方便的构建函数 API。

![](https://raw.githubusercontent.com/zhenfeng-zhu/pic-go/main/202301081909263.png)

如上图所示，`[name].ts` 就是动态的 api 路由，我们可以在函数中获取到 name 参数。

```ts
import { HandlerContext } from "$fresh/server.ts";
import { importString } from "https://deno.land/x/import@v0.1.6/mod.ts";
import { Database } from "../../utils/database.ts";

const db = new Database();

export const handler = async (
  _req: Request,
  _ctx: HandlerContext
): Promise<Response> => {
  if (_req.method != "POST") {
    return Response.json({ error: "only support post" });
  }

  const payload = await _req.json();
  console.log(`payload: ${payload}`);
  const data = await db.find_by_name(payload.name);

  const func = data[0];
  if (func.name != payload.name) {
    return Response.json({ error: "name is not equal" });
  }

  console.log(func.content);
  const mod = await importString(func.content);
  const result = await mod.handler();
  return Response.json(result);
};
```

你会发现，我在这里引入了一个 db。

这里的考虑主要是，现阶段 Sui 还是在 Devnet 阶段，数据会被定期清理。同时现阶段的链上访问速度还不是很高，我们需要用一个 db 来做代码的缓存层。降低冷启动时间。

supabase 就是这样的一个数据库，非常好用。

1. 可视化建表，更新表结构，做到了 low code，甚至是 no code。
2. 易用的 API。

supabase 的 api 非常简洁易用，比如我们要从中 CRUD 数据，可以：

```ts
async insert_move(data: Array<MoveFunc>) {
    const res = await this.#client.from("move_functions").insert(data);
    console.log(res);
    return res;
}

async find_by_name(name: string): Promise<MoveFunc[] | null> {
    const { data } = await this.#client
      .from("move_functions")
      .select("*")
      .eq("name", name);
    return data;
}
```

# Landing Page

仅有简单的命令行是不够的，每一个成功的产品，都需要一个 Landing Page。

这里我仍然使用 Fresh 来做，这里偏前端工作，而且实现起来也比较简单，大家可以直接访问源码仓库查看即可。

# 总结

关于 faas3 的快速使用，大家可以参考文章：[FaaS3 快速入门](./get_started.md)

项目仍然处于比较早期的阶段，欢迎大家一起来添砖加瓦。

- [faas3](https://github.com/faas3/faas3)：faas3 的 Runtime 和 websit。
- [faas3-cli](https://github.com/faas3/faas3-cli)：faas3 的命令行工具
- [faas3-move](https://github.com/faas3/faas3-move)：move 合约
