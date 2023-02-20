## 导入

```javascript
import XLSort from "xl-sort";
```

## 实例化

```javascript
const sortInstance = new XLSort();
```

## api

```javascript
// 注入 基本conf
sortInstance.injectBasicConfig({
  basicConfig: [
    {
      configId: 0,
      order: "asc", // 'asc' 升序 'desc' 降序
      field: "baseKey", // 每个节点按指定key排序
      sortType: "string", // 指定排序字段的类型
    },
  ],
});
```

```javascript
// 注入 默认conf
sortInstance.injectDefaultConfig({
  type: "BD1001",
  defaultConfig: [
    {
      configId: 2,
      order: "asc",
      field: "defaultKey",
      sortType: "string",
    },
  ],
});
```

```javascript
// 订阅自定义排序
sortInstance.subConf({
  type: "BD1001",
  config: {
    configId: 3,
    order: "desc",
    // field 或者 where 任选其一 where适合更复杂的场景排序
    where: (Node) => {
      // 如果节点(node)的 type属性为 1 ,则按节点的Au属性排序
      if (Node.type === 1) {
        return "Au";
      }
      // 如果节点(node)的 type属性为 2 ,则按节点的Bu属性排序
      if (Node.type === 2) {
        return "Bu";
      }
    },
    sortType: "number",
  },
});
```

```javascript
// 删除 排序方法
sortInstance.deleteSubConf({
  type: "BD1001",
  configId: 3,
});
```

```javascript
// 更新 排序方法
sortInstance.updateSubConf({
  type: "BD1001",
  configId: 3,
  config: {
    order: "desc",
  },
});
```

## 排序

```javascript
// 排序
sortInstance.dispatchSort({
  type: "BD1001",
  data: tree, // tree是一个树结构的数据 或者数组
  childrenFieldName: "child", // 选填 如果是树结构数据 children属性重命名
});
```
