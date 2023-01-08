/** @jsx h */

import blog, { ga, h, redirects } from "blog";
import "./prismjs-extensions.ts";

blog({
  title: "Fenix's Blog",
  description: "code less, play more!",
  avatar: "./avatar.jpeg",
  favicon: "./favicon.ico",
  avatarClass: "rounded-full",
  cover: "./background.png",
  author: "Fenix",
  theme: "auto",
  links: [
    { title: "Email", url: "mailto:codeless98@163.com" },
    { title: "GitHub", url: "https://github.com/zhenfeng-zhu" },
    { title: "Twitter", url: "https://twitter.com/testzfz" },
  ],
  lang: "zh-CN",
  middlewares: [
    // If you want to set up Google Analytics, paste your GA key here.
    ga("G-8BDK60YDQH"),
    // If you want to provide some redirections, you can specify them here,
    // pathname specified in a key will redirect to pathname in the value.
    // redirects({
    //   "/hello_world.html": "/hello_world",
    // }),
  ],
});
