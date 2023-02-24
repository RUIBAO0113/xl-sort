class XLSort {
    constructor() {
        this.configIdList = []
        this.defaultConfig = {};
        this.baseConfig = {};
        this.config = {};
        this.childFieldAlias = '';
    }
    warn() {
        console.warn(`Function parameter format warn
      {
          configId: Number | String
          order: 'asc' | 'desc'
          field: String
          sortType: 'string' | 'number' | 'date'
          where: (param: Object): String
      }`);
    }
    isVerificationPassed(param) {
        let result = true;
        const isRightId = typeof param.configId === 'number';
        const isRightOrder = param.order === 'asc' || param.order === 'desc';
        const isRightFieldType = this.isString(param.field) || typeof param.field === 'function'
        const isRightField = param.field && isRightFieldType
        const isSortType =
            (param.sortType === 'string' ||
                param.sortType === 'number' ||
                param.sortType === 'date');
        isRightId && isRightOrder && isSortType && isRightField ?
            (result = true) :
            (result = false);
        if (this.configIdList.includes(param.configId) || !Reflect.has(param, 'configId')) {
            result = false
        }
        if (!result) {
            this.warn()
        }
        return result;
    }
    isArray(n) {
        return Array.isArray(n);
    }
    isString(n) {
        return typeof n === 'string';
    }
    isObject(n) {
        return Object.prototype.toString.call(n) === '[object Object]';
    }
    subBaseConf(type, baseConfig) {
        if (!this.isString(type)) {
            return
        }
        if (!this.isVerificationPassed(baseConfig)) {
            return;
        }
        if (type in this.baseConfig) {
            this.baseConfig[type].push(baseConfig)
        } else {
            this.baseConfig[type] = [baseConfig]
        }
        return this;
    }
    subDefaultConf(type, config) {
        if (!this.isString(type)) {
            return;
        }
        if (!this.isVerificationPassed(config)) {
            return;
        }
        if (type in this.defaultConfig) {
            this.defaultConfig[type].push(config)
        } else {
            this.defaultConfig[type] = [config]
        }

        return this;
    }
    mergeUseConfig(type) {
        const baseConfig = this.baseConfig[type] || []
        const defaultConfig = this.defaultConfig[type] || []
        const customConfig = this.config[type] || []
        let configList = [];
        if (customConfig && customConfig.length > 0) {
            configList = baseConfig.concat(customConfig);
        } else {
            if (defaultConfig && defaultConfig.length > 0) {
                configList = baseConfig.concat(defaultConfig);
            } else {
                configList = baseConfig;
            }
        }
        return configList;
    }
    transformVal(cur, next, config) {
        // val
        let curVal = null;
        let nextVal = null;
        // field
        let curField = null;
        let nextField = null;
        if (typeof config.field === 'string') {
            curField = config.field;
            nextField = config.field;
        } else if (typeof config.field === 'function') {
            curField = config.field(cur);
            nextField = config.field(next);
        }
        if (!curField || !nextField) {
            return {
                curVal: '',
                nextVal: ''
            };
        }
        switch (config.sortType) {
            // 字符串
            case 'string':
                curField in cur ? (curVal = cur[curField].toString()) : (curVal = '');
                nextField in next ?
                    (nextVal = next[nextField].toString()) :
                    (nextVal = '');
                break;
            case 'number':
                curField in cur ? (curVal = Number(cur[curField])) : (curVal = 0);
                nextField in next ? (nextVal = Number(next[nextField])) : (nextVal = 0);
                break;
            case 'date':
                curField in cur ? (curVal = Date.parse(cur[curField])) : (curVal = 0);
                nextField in next ?
                    (nextVal = Date.parse(next[nextField])) :
                    (nextVal = 0);
                break;
            default:
                curVal = '';
                nextVal = '';
        }
        return {
            curVal,
            nextVal
        };
    }
    handleSort(curVal, nextVal, config) {
        if (config.sortType === 'string') {
            if (config.order === 'asc') {
                const ascD = curVal.localeCompare(nextVal);
                return ascD;
            } else {
                const descD = nextVal.localeCompare(curVal);
                return descD;
            }
        } else {
            if (config.order === 'asc') {
                return curVal - nextVal;
            } else {
                return nextVal - curVal;
            }
        }
    }
    subConf(type, config) {
        if (!this.isString(type)) {
            return;
        }
        if (!this.isObject(config)) {
            return;
        }
        if (!this.isVerificationPassed(config)) {
            return;
        }
        if (type in this.config) {
            this.config[type].push(config);
        } else {
            this.config[type] = [config];
        }
    }
    deleteConf(type, configId) {
        if (!this.isString(type)) {
            return;
        }
        let isDeleted = false
        const config = this.config[type] || []
        for (let i = config.length - 1; i >= 0; i--) {
            if (config[i].configId === configId) {
                isDeleted = true
                config.splice(i, 1);
                break
            }
        }
        if (isDeleted) {
            return
        }
        const defaultConfig = this.defaultConfig[type] || []
        for (let i = defaultConfig.length - 1; i >= 0; i--) {
            if (defaultConfig[i].configId === configId) {
                isDeleted = true
                defaultConfig.splice(i, 1);
                break
            }
        }
        if (isDeleted) {
            return
        }
        const baseConfig = this.baseConfig[type] || []
        for (let i = baseConfig.length - 1; i >= 0; i--) {
            if (baseConfig[i].configId === configId) {
                baseConfig.splice(i, 1);
            }
        }
    }
    updateConf(type, configId, updateConfig) {
        if (!this.isString(type)) {
            return;
        }
        let isDeleted = false
        if (this.isArray(this.config[type])) {
            for (let i = this.config[type].length - 1; i >= 0; i--) {
                if (this.config[type][i].configId === configId) {
                    isDeleted = true
                    this.config[type][i] = {
                        ...this.config[type][i],
                        ...updateConfig
                    }
                    break
                }
            }
        }
        if (isDeleted) {
            return
        }
        if (this.isArray(this.defaultConfig[type])) {
            for (let i = this.defaultConfig[type].length - 1; i >= 0; i--) {
                if (this.defaultConfig[type][i].configId === configId) {
                    isDeleted = true

                    this.defaultConfig[type][i] = {
                        ...this.defaultConfig[type][i],
                        ...updateConfig
                    }
                    break
                }
            }
        }
        if (isDeleted) {
            return
        }
        if (this.isArray(this.baseConfig[type])) {
            for (let i = this.baseConfig[type].length - 1; i >= 0; i--) {
                if (this.baseConfig[type][i].configId === configId) {
                    this.baseConfig[type][i] = {
                        ...this.baseConfig[type][i],
                        ...updateConfig
                    }
                    break
                }
            }
        }
    }
    sortChild(data, configList) {
        for (let i = 0; i < data.length; i++) {
            if (data[i][this.childFieldAlias]) {
                this.main(configList, data[i][this.childFieldAlias]);
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
    dispatchSort(type, {
        data,
        childFieldAlias
    }) {
        this.childFieldAlias = childFieldAlias || 'children';
        if (!this.isString(type)) {
            return;
        }
        if (!this.isString(this.childFieldAlias)) {
            return;
        }
        if (!this.isArray(data)) {
            return;
        }
        const configList = this.mergeUseConfig(type);
        this.main(configList, data);
        return {
            data
        };
    }
}
export default new XLSort()