---
title: Tic-Toe合约案例分享和源码解析
publish_date: 2023-01-15
---

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
