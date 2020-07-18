# ui-test-vue-loader 加载器

## 说明

用于辅助 UI 测试，项目编译打包时在目标节点上添加 ID 或 CLASS ，便于自动化工具提取节点。

* 后期将会抽空拓展功能，不再局限于仅在Vue项目中使用，敬请期待！

## 配置使用

webpack.base.conf.js
```js
module.exports = {
  ...
  module: {
    rules: [
      ...
      {
        test: /\.vue$/,
        loader: resolve('isesol-ui/lib/webpack/uiTestLoader'),
        options: {
          delete: process.env.ENV === 'prod',
          startPath: 'src\\',
          id: { style: 'test-[path]-[value]', attrName: 'test-id' },
          class: { style: 'test-[path]-[ext]-[value]-last', attrName: 'test-class', startPath: 'src\\components\\', delete: false }
        }
      },
      ...
    ]
  },
  ...
}
```

## 参数说明

### delete

* 类型：`Boolean`
* 默认值：`false`，非必需
* 描述：正式环境标签中不需要`test-class`属性出现，则配置 delete: true 即可删除。

### startPath

* 类型：`String`
* 默认值：`src\\`，非必需
* 描述：文件路径截取有效区间，startPath 即为开始截取字符串。

### style

* 类型：`String`
* 默认值：`[path]-[value]`，非必需
* 描述：最终输出的 ID 和 CLASS 字符样式。其中提供部分参数供选择，如下

| 名称 | 说明 | 举例
| - | - | - |
| path | 截取后的有效文件路径 | components-pages-order-manage |
| value | 标签设置的名称 | submit-btn |
| ext | 文件后缀名 | vue |

### id 

* 类型：`Object`
* 默认值：无默认值，非必需
* 描述：id 为真，则会转换目标 ID ，如果没有则不转换。

### class

* 类型：`Object`
* 默认值：无默认值，非必需
* 描述：class 存在，则会转换目标 CLASS ，如果没有则不转换。

### attrName

* 类型：`String`
* 默认值：`test-class | test-id`，非必需
* 描述：需要转换的标签属性

## 其他说明

除了 attrName 外，其他参数如果在 options.class 和 options.id 中一致的话，都可以提取到 options 中。
```js
options: {
  delete: process.env.ENV === 'prod',
  startPath: 'src\\',
  style: 'test-[path]-[value]',
  id: { attrName: 'test-id' },
  class: { attrName: 'test-class', delete: false }
}
```
最终会被解析为如下形式去执行：
```js
options: {
  id: { attrName: 'test-id', delete: process.env.ENV === 'prod', startPath: 'src\\', style: 'test-[path]-[value]' },
  class: { attrName: 'test-class', delete: false, startPath: 'src\\', style: 'test-[path]-[value]' }
}
```

## 使用举例
example/src/app/detail.vue
```html
<template>
  <div class="title" test-class="title">示例</div>
  <label>用户名：</label>
  <input class="username" type="text"  test-id="username"/>
  <ul>
    <li test-class="first-text">第一行文字</li>
    <li>第二行文字</li>
    <li test-id="third-text">第三行文字</li>
    <li>第四行文字</li>
  </ul>
  <p>我是一段示例文本，我是一段示例文本，我是一段示例文本，我是一段示例文本，我是一段示例文本。</p>
  <button test-id="submit" class="btn" test-class="submit">确认</button>
</template>
```
build/webpack.base.conf.js
```js
options: {
  delete: false,
  startPath: 'src\\',
  style: 'test-[path]-[value]',
  id: { attrName: 'test-id' },
  class: { attrName: 'test-class' }
}
```
最终输出如下：
```html
<template>
  <div class="title test-app/detail-title">示例</div>
  <label>用户名：</label>
  <input type="text" id="test-app/detail-username" class="username">
  <ul>
    <li class="test-app/detail-first-text">第一行文字</li>
    <li>第二行文字</li>
    <li id="test-app/detail-third-text">第三行文字</li>
    <li>第四行文字</li>
  </ul>
  <p>我是一段示例文本，我是一段示例文本，我是一段示例文本，我是一段示例文本，我是一段示例文本。</p>
  <button id="test-app/detail-submit" class="btn test-app/detail-submit">确认</button>
</template>
```
