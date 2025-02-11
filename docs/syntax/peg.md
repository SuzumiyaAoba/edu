# PEG (Parsing Expression Grammer)

## 定義

- 非終端記号の有限集合 𝑁
- 終端記号の有限集合 ∑
- 規則の有限集合 𝑃

規則の形

```
𝐴 ← 𝑒
```

```
e := 𝜎
   | 𝑛
   | 𝜖
   | 𝑒₁ 𝑒₂
   | 𝑒₁ / 𝑒₂
   | 𝑒*
   | 𝑒+
   | 𝑒?
   | &𝑒
   | !𝑒
```

## 参考 URL

- [Parsing Expression Grammar - Wikipedia](https://ja.wikipedia.org/wiki/Parsing_Expression_Grammar)
- [PEG基礎文法最速マスター - kmizuの日記](https://kmizu.hatenablog.com/entry/20100203/1265183754)
- [Parsing Expression Grammar(PEG)の使い方 #構文解析 - Qiita](https://qiita.com/SenK/items/8655e7eb2dcb0649832b)
- [PEGパーサを布教してみる](https://zenn.dev/senk/articles/c462453673ac81)
- [\[入門\] 全自作言語erに告ぐ、PEG パーサはいいぞ](https://zenn.dev/garnet3106/articles/c1e662100f5acc)
- [PEGで構文解析をする | PPT](https://www.slideshare.net/slideshow/peg-251688145/251688145)
- [続くといいな日記 – ptera 式 PEG パーサ生成法](https://mizunashi-mana.github.io/blog/posts/2021/11/peg-parser-generating-by-ptera/)
