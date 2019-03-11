
const loaderUtils = require('loader-utils')
const parse5 = require('parse5')

var Options = {}
// 错误定义
const errorInfo = {
  attrName: '[UI-TEST-VUE-LOADER] webpack 配置缺失参数：attrName，已默认为‘test-id’ and ‘test-class’，如不符合需求，请修改配置',
  style: '[UI-TEST-VUE-LOADER] webpack 配置缺失参数：style，已默认为‘[path]-[value]’ ，如不符合需求，请修改配置'
}
// 弹出提示
function warning (type) {
  if (errorInfo[type]) throw new Error(errorInfo[type])
}

// 格式化参数
function formatOptions (options) {
  let opt = {}
  let map = ['id', 'class']
  map.forEach(type => {
    options[type] && (opt[type] = {
      delete: options[type].delete || options.delete || false,
      startPath: options[type].startPath || options.startPath || 'src\\',
      style: options[type].style || options.style || '[path]-[value]',
      attrName: options[type].attrName || 'test-' + type
    })
    // 参数配置不正确则报错
    !options[type].attrName && warning('attrName')
    (!options[type].style && !options.style) && warning('style')
  })
  return opt
}

// 替换函数
function replaceFunc (attrs, type) {
  let arr = []
  let opt = Options[type]
  let val = ''
  if (Options[type]) {
    let filePath = Options.resourcePath.split(opt.startPath).pop()
    let ext = filePath.split('.').pop()
    let path = filePath.split('.' + ext)[0].replace('\\', '/')
    attrs.forEach(attr => {
      if (attr.name === opt.attrName) {
      // 计算目标 属性 的展现形式
      let itemValue = attr.value
      let style = opt.style.replace('[path]', path).replace('[ext]', ext).replace('[value]', itemValue)
      !opt.delete && (val += style + ' ')
      } else if (attr.name === type) {
        val += attr.value + ' '
      } else {
        arr.push(attr)
      }
    })
    val && arr.push({name: type, value: trim(val)})
  } else {
    arr = attrs
  }
  return arr
}

// 去除左右空格
function trim (str) {
  return str.replace(/^\s+/, '').replace(/\s+$/, '')
}

// 遍历 dom 树，查找对应属性
function parseFunc (dom) {
  if (dom.nodeName === ('#text' || 'script' || 'style')) return dom
  if (dom.childNodes) {
    dom.childNodes.forEach(item => {
      item = parseFunc(item)
    })
  }
  if (dom.attrs && dom.attrs.length) {
    dom.attrs = replaceFunc(dom.attrs, 'class')
    dom.attrs = replaceFunc(dom.attrs, 'id')
  }
  if (dom.content) {
    dom.content = parseFunc(dom.content)
  }
  return dom
}

// 主函数
module.exports = function (source, map) {
  this.cacheable()
  // 获取参数
  var options = loaderUtils.getOptions(this)
  Options = {
    ...formatOptions(options),
    resourcePath: this.resourcePath
  }
  source = parse5.parseFragment(source)
  source = parseFunc(source)
  source = parse5.serialize(source)

  this.callback(null, source, map)
  return source
}
