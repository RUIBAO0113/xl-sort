/**
 * sort-config
 * {
 *  configId: Number|String
 *  order: 'asc'|'desc'
 *  field:  String,
 *  sortType: 'string' | 'number' | 'date'
 *  where: (param:Object):String => {}
 * }
 */
class XLSort {
    constructor() {
        this.defaultConfig = [];
        this.basicConfig = [];
        this.config = {};
        this.childrenFieldName = "";
    }
    isRightParam(paramList) {
        let result = true;
        paramList.map((param) => {
            const isRightId = param.id && typeof param.id === "number";
            const isRightOrder =
                param.order && (param.order === "asc" || param.order === "desc");
            const isRightField = param.field && this.isString(param.field);
            const isSortType =
                param.sortType &&
                (param.sortType === "string" ||
                    param.sortType === "number" ||
                    param.sortType === "date");
            const isHaveWhereFunc = typeof param.where === "function";
            isRightId && isRightOrder && isSortType ?
                (result = true) :
                (result = false);
            isRightField || isHaveWhereFunc ? (result = true) : (result = false);
        });
        if (!result) {
            console.error(`Function parameter format error 
            {
                configId: Number | String
                order: 'asc' | 'desc'
                field: String
                sortType: 'string' | 'number' | 'date'
                where: (param: Object): String => { }
            }`);
        }
        return result;
    }
    isArray(n) {
        return Array.isArray(n);
    }
    isString(n) {
        return typeof n === "string";
    }
    isObject(n) {
        return n.__proto__ === Object.prototype;
    }
    // 注入 基本排序Conf
    /**
     *
     * @param {[]} basicConfig
     */
    injectBasicConfig({
        basicConfig = []
    }) {
        if (!this.isArray(basicConfig)) {
            console.error("Function basicConfig parameter type error must be Array");
            return;
        }
        if (!this.isRightParam(basicConfig)) {
            return;
        }
        this.basicConfig = basicConfig;
        return this;
    }
    // 注入 默认排序Conf
    /**
     *
     * @param {String} type
     * @param {[]} defaultConfig
     */
    injectDefaultConfig({
        type,
        defaultConfig = []
    }) {
        if (!this.isString(type)) {
            console.error("Function type parameter type error must be String");
            return;
        }
        if (!this.isArray(defaultConfig)) {
            console.error(
                "Function defaultConfig parameter type error must be Array"
            );
            return;
        }
        if (!this.isRightParam(defaultConfig)) {
            return;
        }
        this.defaultConfig[type] = defaultConfig;
        return this;
    }
    // 清楚所有规则
    clearAllConfig() {
        this.defaultConfig = [];
        this.basicConfig = [];
        this.config = {};
    }
    // 合并排序规则
    mergeUseConfig(type) {
        // 基本排序规则
        const basicConfig = this.basicConfig;
        // 默认排序
        const defaultConfig = this.defaultConfig[type];
        // 新加排序
        const customConfig = this.config[type];
        // 最终排序规则
        let configList = [];
        if (customConfig && customConfig.length > 0) {
            configList = basicConfig.concat(customConfig);
        } else {
            if (defaultConfig && defaultConfig.length > 0) {
                configList = basicConfig.concat(defaultConfig);
            } else {
                configList = basicConfig;
            }
        }
        return configList;
    }
    // 转换value
    transformVal(cur, next, config) {
        // val
        let curVal = null;
        let nextVal = null;
        // field
        let curField = null;
        let nextField = null;
        const field = config.field;
        const whereFunc = config.where;
        if (field) {
            curField = field;
            nextField = field;
        } else if (whereFunc) {
            curField = whereFunc(cur);
            nextField = whereFunc(next);
        }
        if (!curField || !nextField) {
            console.error("transformVal params error");
            return {
                curVal: "",
                nextVal: "",
            };
        }
        switch (config.sortType) {
            // 字符串
            case "string":
                curField in cur ? (curVal = cur[curField].toString()) : (curVal = "");
                nextField in next ?
                    (nextVal = next[nextField].toString()) :
                    (nextVal = "");
                break;
            case "number":
                curField in cur ? (curVal = Number(cur[curField])) : (curVal = 0);
                nextField in next ? (nextVal = Number(next[nextField])) : (nextVal = 0);
                break;
            case "date":
                curField in cur ? (curVal = Date.parse(cur[curField])) : (curVal = 0);
                nextField in next ?
                    (nextVal = Date.parse(next[nextField])) :
                    (nextVal = 0);
                break;
            default:
                curVal = "";
                nextVal = "";
        }
        return {
            curVal,
            nextVal,
        };
    }
    handleSort(curVal, nextVal, config) {
        if (config.sortType === "string") {
            if (config.order === "asc") {
                const ascD = curVal.localeCompare(nextVal);
                return ascD;
            } else {
                const descD = nextVal.localeCompare(curVal);
                return descD;
            }
        } else {
            if (config.order === "asc") {
                return curVal - nextVal;
            } else {
                return nextVal - curVal;
            }
        }
    }
    getConf({
        type
    }) {
        if (!this.isString(type)) {
            console.error("Function type parameter type error must be String");
        }
        return this.config[type];
    }
    subConf({
        type,
        config
    }) {
        if (!this.isString(type)) {
            console.error("Function type parameter type error must be String");
            return;
        }
        if (!this.isObject(config)) {
            console.error("Function config  parameter type error must be Object");
            return;
        }
        if (!this.isRightParam([config])) {
            return;
        }
        if (type in this.config) {
            this.config[type].push(config);
        } else {
            this.config[type] = [config];
        }
    }
    deleteSubConf({
        type,
        configId
    }) {
        if (!this.isString(type)) {
            console.error("Function type parameter type error must be String");
            return;
        }
        if (!this.isString(configId) && typeof configId !== "number") {
            console.error(
                "Function configId type parameter type error must be String"
            );
            return;
        }
        const configList = this.config[type];
        for (let i = configList.length - 1; i >= 0; i--) {
            if (configList[i].configId === configId) {
                configList.splice(i, 1);
            }
        }
    }
    updateSubConf({
        type,
        configId,
        config
    }) {
        if (!this.isString(type)) {
            console.error("Function type parameter type error must be String");
            return;
        }
        if (!this.isString(configId) && typeof configId !== "number") {
            console.error("Function configId parameter type error must be String");
            return;
        }
        if (!this.isObject(config)) {
            console.error("Function config parameter type error must be Object");
            return;
        }
        const configList = this.config[type];
        for (let i = configList.length - 1; i >= 0; i--) {
            if (configList[i].configId === configId) {
                configList[i] = {
                    ...configList[i],
                    ...config,
                };
            }
        }
    }
    sortChild(data, configList) {
        for (let i = 0; i < data.length; i++) {
            if (data[i][this.childrenFieldName]) {
                this.main(configList, data[i][this.childrenFieldName]);
            }
        }
    }
    main(configList, data) {
        data.sort((cur, next) => {
            let res = null;
            let isSortSuccess = false;
            for (let i = 0; i < configList.length; i++) {
                const config = configList[i];
                if (isSortSuccess) {
                    break;
                }
                const {
                    curVal,
                    nextVal
                } = this.transformVal(cur, next, config);
                if (i === configList.length - 1) {
                    res = this.handleSort(curVal, nextVal, config);
                    break;
                }
                if (curVal !== nextVal) {
                    isSortSuccess = true;
                    res = this.handleSort(curVal, nextVal, config);
                }
            }
            return res;
        });
        return this.sortChild(data, configList);
    }
    dispatchSort({
        type,
        data,
        childrenFieldName
    }) {
        this.childrenFieldName = childrenFieldName || "children";
        if (!this.isString(type)) {
            console.error("Function type parameter type error must be String");
            return;
        }
        if (!this.isString(this.childrenFieldName)) {
            console.error(
                "Function childrenFieldName parameter type error must be String"
            );
            return;
        }
        if (!this.isArray(data)) {
            console.error("Function data parameter type error must be Array");
            return;
        }
        const configList = this.mergeUseConfig(type);
        console.log("configList", configList);
        this.main(configList, data);
        return {
            data,
        };
    }
}
export default XLSort