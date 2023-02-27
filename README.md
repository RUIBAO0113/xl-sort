> 应用场景- 树形结构数据 多列排序

```javascript
const TreeData = [
  {
    base: "base1",
    BQ: 1,
    V1: 12,
    V2: 3,
    CUS: "LH002",
    Date: "2022-01-25 18:17:38.861",
    children: [
      {
        base: "base1",
        BQ: 1,
        V1: 12,
        V2: 3,
        Date: "2050-01-25 18:17:38.861",
        children: [
          {
            base: "base1",
            BQ: 1,
            V1: 12,
            V2: 3,
            CUS: "LH002",
            Date: "2022-2-25 18:17:38.861",
            children: [],
          },
          {
            base: "base1",
            BQ: 1,
            V1: 22,
            V2: 3,
            CUS: "LH002",
            Date: "2022-03-25 18:17:38.861",
            children: [],
          },
        ],
      },
      {
        base: "base1",
        BQ: 1,
        V1: 22,
        V2: 3,
        Date: "2022-07-25 18:17:38.861",
        children: [],
      },
      {
        base: "base2",
        BQ: 1,
        V1: 123,
        V2: 3,
        Date: "2022-07-01 18:17:38.861",
        children: [],
      },
    ],
  },
  {
    base: "base1",
    BQ: 2,
    V1: 22,
    V2: 3,
    CUS: "LH003",
    Date: "2022-11-25 18:17:38.861",
    children: [
      {
        base: "base1",
        BQ: 1,
        V1: 12,
        V2: 3,
        CUS: "LH004",
        Date: "2022-10-15 18:17:38.861",
        children: [],
      },
      {
        base: "base2",
        BQ: 1,
        V1: 22,
        V2: 3,
        CUS: "LH005",
        Date: "2022-10-22 18:17:38.861",
        children: [],
      },
    ],
  },
  {
    base: "base2",
    BQ: 1,
    V1: 123,
    V2: 3,
    CUS: "LH012",
    Date: "2022-10-25 18:17:38.861",
    children: [],
  },
  {
    base: "base2",
    BQ: 2,
    V1: 867,
    V2: 3,
    CUS: "LH013",
    Date: "2025-10-25 18:17:38.861",
    children: [],
  },
];
```

## 导入

```javascript
import XLSort from "XLSort";
const sortInstance = new XLSort();
```

> sub 和 dispatch 时 type 必须一致 如: 'CUTSOM'
> 排序默认是递归节点下有 children

```typeScript
  // 排序规则
    interface SortConfig {
      configId: Number,
      order: 'desc' | 'asc',
      field: String | (Node:Object):String,
      sortType: 'string' | 'number' | 'date'
    }
```

## 简单多列排序

```javascript
// 添加排序规则
sortInstance.subConf("CUSTOM", {
  configId: 0, // 主键 用于更新删除排序规则
  order: "asc", // "asc"升序 或者 "desc"降序
  field: "base", // 指定以base字段排序
  sortType: "string", // 指定字段排序类型 三种 'string' 或 'number' 或者 'date'
});
sortInstance.subConf("CUSTOM", {
  configId: 1,
  order: "desc",
  field: "Date",
  sortType: "date",
});
// 排序(不改变原数组)
sortInstance.dispatchSort("CUSTOM", {
  data: TreeData,
});
```

## 自定义条件多列排序

```javascript
// 添加排序规则
sortInstance.subConf("CUSTOM2", {
  configId: 0, // 主键用于 更新 删除排序规则
  order: "asc", // "asc"升序 或者 "desc"降序
  field: "base", // 指定以base字段排序 类型为 string || function
  sortType: "string", // 指定字段排序类型 三种 'string' 或 'number' 或者 'date'
});
sortInstance.subConf("CUSTOM2", {
  configId: 1,
  order: "desc",
  sortType: "date",
  // 自定义字段排序
  field: (Node) => {
    if (Node.BQ === 1) {
      // 当前节点BQ的值为1 则取节点 V1 的值
      return "V1";
    }
    if (Node.BQ === 2) {
      // 当前节点BQ的值为2 则取节点 V2 的值
      return "V2";
    }
  },
});
sortInstance.dispatchSort("CUSTOM2", {
  data: TreeData,
});
```

## 删除规则

```javascript
// 删除 sub添加的 configId为 2 的规则
sortInstance.deleteConf("CUSTOM", 2);
```

## 更新规则

```javascript
// 更新 sub添加的 configId为 0 的规则
sortInstance.updateConf("CUSTOM", 0, {
  configId: 2,
  order: "desc", // 更新order为'desc'
  // ...
});
```

## 排序

```javascript
sortInstance.dispatchSort("CUSTOM", {
  data: TreeData,
  childFieldAlias: "child", // 可选 递归时子节点别名设置 children => child
});
```

## 其他

```javascript
// 添加基底排序
// CUSTOM上的排序规则 都会以在基底排序之上 再排序
sortInstance.subBaseConf("CUSTOM", {
  configId: 0,
  order: "desc",
  field: "base",
  sortType: "string",
});
// 添加默认排序 如果CUSTOM规则中 已经subConf新加的自定义排序 那么默认排序将会失效 所以最终的排序规则为 最终排序的规则 BaseConf + DefaultConf || Conf
sortInstance.subDefaultConf("CUSTOM", {
  configId: 2,
  order: "desc",
  sortType: "number",
  field: (Node) => {
    if (Node.BQ === 1) {
      return "V2";
    }
    if (Node.BQ === 2) {
      return "V1";
    }
  },
});
```
