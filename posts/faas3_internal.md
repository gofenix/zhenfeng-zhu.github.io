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

# FaaS Runtime

## Deno Runtime

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
import { db } from "../../../utils/database.ts";
import { importString } from "import";
import axiod from "axiod";

export const handler = async (
  _req: Request,
  _ctx: HandlerContext
): Promise<Response> => {
  if (_req.method != "POST") {
    return Response.json({ error: "only support post" });
  }

  const { name } = _ctx.params;
  let payload = await _req.json();
  if (typeof payload == "string") {
    payload = JSON.parse(payload);
  }

  const data = await db.findByName(name);
  const func = data[0];

  let result;
  if (func.template === "deno") {
    result = await runDeno(func.content!, payload);
  } else if (func.template === "node") {
    result = await runNode(func.content!, payload);
  } else {
    result = { reason: "unsupported template" };
  }

  return Response.json(result);
};

async function runDeno(content: string, payload: any) {
  console.log("running in deno...");
  const mod = await importString(content);
  return await mod.handler(payload);
}
```

你会发现，我在这里引入了一个 db。这里的考虑主要是，现阶段 Sui 还是在 Devnet 阶段，数据会被定期清理。同时现阶段的链上访问速度还不是很高，我们需要用一个 db 来做代码的缓存层。降低冷启动时间。

supabase 就是这样的一个数据库，非常好用。

1. 可视化建表，更新表结构，做到了 low code，甚至是 no code。
2. 易用的 API。

supabase 的 api 非常简洁易用，比如我们要从中 CRUD 数据，可以：

```ts
async insertMove(data: Array<MoveFunc>) {
    const res = await this.#client.from("move_functions").insert(data);
    console.log(res);
    return res;
}

async findByName(name: string): Promise<MoveFunc[] | null> {
    const { data } = await this.#client
      .from("move_functions")
      .select("*")
      .eq("name", name);
    return data;
}
```

## Node Runtime

我们这里也支持 Node 函数。虽然 Deno 很美好，但是现阶段有一些第三方包仍然不适配 Deno。另一个考虑的点是 Node 的开发者众多，如果天然支持 Node，会自然吸引很多开发者。

当检测到函数的类型是 node 的时候，会调用远端的 node runtime 来执行。

```ts
async function runNode(content: string, payload: any) {
  console.log("running in node...");
  const result = await axiod.post(
    "https://faas3-next.up.railway.app/api/runtime",
    { content, payload }
  );
  return result.data;
}
```

在远程是用 next 框架来实现的，部署在 railway 上。核心代码参考：

```ts
import type { NextApiRequest, NextApiResponse } from "next";
import { importFromString } from "module-from-string";

type Data = {
  name: string;
};

type Body = {
  content: string;
  payload: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body: Body = req.body;
  const mod = await getMod(body.content);
  const data = await callMod(mod, body.payload);
  res.status(200).json(data);
}

async function getMod(code: string) {
  return await importFromString(code);
}

async function callMod(mod: any, payload: any) {
  return await mod.handler(payload);
}
```

# FaaS3 Cli

在有了上述的 runtime 和合约之后，我们就可以来实现 cli 命令行工具。

在这里，我使用的是 Clap。

```toml
clap = { version = "4.1.4", features = ["derive"] }
```

使用 derive，这样就可以定义 struct 的同时，自动生成我们想要的帮助。

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
        // the function template
        #[arg(short, long)]
        template: String,
    },
    /// deploy the function to runtime and blockchain
    Deploy,
    /// local run
    Run,
    /// remote call the function
    Call {
        /// the function name
        name: String,
        /// the post body, it's json string
        #[arg(short, long)]
        body: String,
    },
    /// list the functions
    List {
        /// the functions of owner
        #[arg(short, long)]
        owner: Option<String>,

        /// the functions in template
        #[arg(short, long)]
        template: Option<String>,
    },
    /// show the function info
    Info {
        /// the function name
        name: String,
    },
    /// verify the runtime function, which should equal to the on-chain code.
    Verify { name: String },
}
```

在 main 函数中，通过强大的模式匹配去解析命令：

```rust
#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
    let cli = Cli::parse();
    match &cli.command {
        Some(Commands::Create { name, template }) => {
            create_action(name.clone(), template.clone()).await?;
        }
        Some(Commands::Deploy) => {
            deploy_action().await?;
        }
        Some(Commands::Run) => {
            println!("This command is still WIP")
        }
        Some(Commands::Call { name, body }) => {
            call_action(name.clone(), body.clone()).await?;
        }
        Some(Commands::List { owner, template }) => {
            list_action(owner.clone(), template.clone()).await?;
        }
        Some(Commands::Verify { name }) => {
            verify_action(name.clone()).await?;
        }
        Some(Commands::Info { name }) => {
            info_action(name.clone()).await?;
        }
        None => {}
    }

    Ok(())
}
```

# 实战：move-did

move-did 项目是 NonceGeek Dao 下面的一个专注 move 生态的 did 项目。

我们可以通过这个样例，来实战一下如何在 faas3 下面开发函数。

## 安装 faas3-cli

```
$ cargo install --force --locked --git https://github.com/faas3/faas3-cli.git
```

## 创建项目

```
$ faas3 create move-did
```

然后我们看下目录结构：

```bash
$ tree
.
├── config.toml
├── main.mjs
└── test.mjs
```

- config.toml 是配置文件。 注意修改 owner 为自己的 sui 的地址。

- main.mjs 是主要文件，在这里写我们的函数。

```ts
// You can import inner sdk
export async function handler(payload) {
  console.log(payload);
}
```

我们可以在这里引入内置的包，目前有 aptos 和 ethers 两个 sdk。

- test.mjs 是测试文件

```ts
// this file is for faas3 run
import { handler } from "./main.mjs";

const res = await handler();
console.log(res);
```

## 编写函数

首先引入 aptos 的 sdk。

```ts
import * as aptos from "aptos";
```

我们可以从 payload 中拿到请求的参数，这里请求的参数为 addr，也就是传入的地址。

```ts
import * as aptos from "aptos";

export async function handler(payload) {
  const NODE_URL = "https://fullnode.testnet.aptoslabs.com";
  const client = new aptos.AptosClient(NODE_URL);

  console.log("Your payload is ");
  console.log(payload);
  const dogAddr = payload.addr;
  const dog = new aptos.HexString(dogAddr);
  const AddrAggregator = await client.getAccountResource(
    dog,
    "0x65f4a0954aa6e68d2381ff98b7676df2fe57beee3ca37a4a8a57fa621c1db872::addr_aggregator::AddrAggregator"
  );

  const {
    key_addr: keyAddr,
    type: rawType,
    description,
    addrs,
    addr_infos_map: { handle },
  } = AddrAggregator.data;

  const key = addrs[0];
  const syntax =
    "did:movedid:0x2df41622c0c1baabaa73b2c24360d205e23e803959ebbcb0e5b80462165893ed";

  const methods = await genVerificationMethods(client, handle, syntax, key);

  const services = await genServices(client, keyAddr, syntax);

  const result = {
    id: syntax,
    type: genType(rawType),
    description,
    verification_methods: methods,
    services,
  };

  return result;
}

async function genVerificationMethods(client, handle, syntax, key) {
  const item = await client.getTableItem(handle, {
    key_type: "0x1::string::String",
    value_type:
      "0x65f4a0954aa6e68d2381ff98b7676df2fe57beee3ca37a4a8a57fa621c1db872::addr_info::AddrInfo",
    key,
  });
  return [
    {
      id: `${syntax}-${key}}`,
      internal_id: item.id,
      properties: {
        description: item.description,
        chains: item.chains,
      },
      type: addrType(item.addr_type),
      addr: item.addr,
      pubkey: item.pubkey,
      verificated: verify(item.signature),
      verification: {
        msg: item.msg,
        signature: item.signature,
      },
      created_at: item.created_at,
      expired_at: item.expired_at,
    },
  ];
}

async function genServices(client, keyAddr, syntax) {
  const ServiceAggregator = await client.getAccountResource(
    keyAddr,
    "0x65f4a0954aa6e68d2381ff98b7676df2fe57beee3ca37a4a8a57fa621c1db872::service_aggregator::ServiceAggregator"
  );
  const {
    names: keys,
    services_map: { handle },
  } = ServiceAggregator.data;

  const item = await client.getTableItem(handle, {
    key_type: "0x1::string::String",
    value_type:
      "0x65f4a0954aa6e68d2381ff98b7676df2fe57beee3ca37a4a8a57fa621c1db872::service_aggregator::Service",
    key: keys[0],
  });

  return {
    id: `${syntax}-${keys[0]}}`,
    description: item.description,
    verification_url: item.verification_url,
    url: item.url,
  };
}

function addrType(type) {
  switch (type) {
    case "0":
      return "EcdsaSecp256k1VerificationKey2019";
    case "1":
      return "Ed25519VerificationKey2020";
    default:
      return "other";
  }
}

function verify(signature) {
  if (signature == "0x") {
    return false;
  }
  return true;
}
function genType(rawType) {
  switch (rawType) {
    case "0":
      return "Human";
    case "1":
      return "DAO";
    case "2":
      return "Bot";
    default:
      return "other";
  }
}
```

## 如何本地测试

我们可以通过 npm init 的方式，安装 aptos 包到本地。

然后在 test 中执行测试代码。

```bash
$ tree
.
├── config.toml
├── main.mjs
├── node_modules
│   └── aptos -> .pnpm/aptos@1.6.0/node_modules/aptos
├── package.json
├── pnpm-lock.yaml
├── readme.md
└── test.mjs
```

test.mjs 的代码如下：

```ts
import { handler } from "./main.mjs";
const res = await handler({
  addr: "0x2df41622c0c1baabaa73b2c24360d205e23e803959ebbcb0e5b80462165893ed",
});
console.log(res);
```

然后执行 `node test.mjs`即可看到输出

```bash
$ node test.mjs
Your payload is
{
  addr: '0x2df41622c0c1baabaa73b2c24360d205e23e803959ebbcb0e5b80462165893ed'
}
{
  id: 'did:movedid:0x2df41622c0c1baabaa73b2c24360d205e23e803959ebbcb0e5b80462165893ed',
  type: 'Human',
  description: 'My First DID',
  verification_methods: [
    {
      id: 'did:movedid:0x2df41622c0c1baabaa73b2c24360d205e23e803959ebbcb0e5b80462165893ed-0x73c7448760517E3E6e416b2c130E3c6dB2026A1d}',
      internal_id: '1',
      properties: [Object],
      type: 'EcdsaSecp256k1VerificationKey2019',
      addr: '0x73c7448760517E3E6e416b2c130E3c6dB2026A1d',
      pubkey: '',
      verificated: false,
      verification: [Object],
      created_at: '1673525423',
      expired_at: '1705061423'
    }
  ],
  services: {
    id: 'did:movedid:0x2df41622c0c1baabaa73b2c24360d205e23e803959ebbcb0e5b80462165893ed-github}',
    description: "leeduckgo's github",
    verification_url: 'https://gist.github.com/0x',
    url: 'https://github.com/leeduckgo'
  }
}
```

## 部署

deploy 到 faas3 系统。

```bash
$ faas3 deploy
```

## 使用

可以使用 faas-cli 的 call 命令调用，也可以通过 curl 的方式来调用。

- call 命令

```bash
$ faas3 call move-did --body '{"addr" : "0x2df41622c0c1baabaa73b2c24360d205e23e803959ebbcb0e5b80462165893ed"}'
✅ Your resp is:
 Object {
    "id": String("did:movedid:0x2df41622c0c1baabaa73b2c24360d205e23e803959ebbcb0e5b80462165893ed"),
    "type": String("Human"),
    "description": String("My First DID"),
    "verification_methods": Array [
        Object {
            "id": String("did:movedid:0x2df41622c0c1baabaa73b2c24360d205e23e803959ebbcb0e5b80462165893ed-0x73c7448760517E3E6e416b2c130E3c6dB2026A1d}"),
            "internal_id": String("1"),
            "properties": Object {
                "description": String("A Test Addr"),
                "chains": Array [
                    String("ethereum"),
                ],
            },
            "type": String("EcdsaSecp256k1VerificationKey2019"),
            "addr": String("0x73c7448760517E3E6e416b2c130E3c6dB2026A1d"),
            "pubkey": String(""),
            "verificated": Bool(false),
            "verification": Object {
                "msg": String("50789538.1.nonce_geek"),
                "signature": String("0x"),
            },
            "created_at": String("1673525423"),
            "expired_at": String("1705061423"),
        },
    ],
    "services": Object {
        "id": String("did:movedid:0x2df41622c0c1baabaa73b2c24360d205e23e803959ebbcb0e5b80462165893ed-github}"),
        "description": String("leeduckgo's github"),
        "verification_url": String("https://gist.github.com/0x"),
        "url": String("https://github.com/leeduckgo"),
    },
}
```

- curl

```bash
$ curl --location --request POST 'https://faas3.deno.dev/api/runner/move-did' \
--header 'Content-Type: application/json' \
--data-raw '{
    "addr" : "0x2df41622c0c1baabaa73b2c24360d205e23e803959ebbcb0e5b80462165893ed"
}'
```

# 总结

关于 faas3 的快速使用，大家可以参考文章：[FaaS3 快速入门](./get_started.md)

项目仍然处于比较早期的阶段，欢迎大家一起来添砖加瓦。

- [faas3](https://github.com/faas3/faas3)：faas3 的 Runtime 和 websit。
- [faas3-cli](https://github.com/faas3/faas3-cli)：faas3 的命令行工具
- [faas3-move](https://github.com/faas3/faas3-move)：move 合约
- [faas3-next-runtime](https://github.com/faas3/faas3-next-runtime)：node 的 runtime
