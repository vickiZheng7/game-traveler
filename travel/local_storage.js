// 定义一个名为“StorageManager”的类
var LocalStorageManager = /** @class */ (function () {
    function LocalStorageManager() {
    }
    // 定义一个静态方法，用于从localStorage中获取存储的数据
    LocalStorageManager.get = function (key) {
        var value = localStorage.getItem(key);
        if (value !== null) {
            return JSON.parse(value);
        }
        return null;
    };
    // 定义一个静态方法，用于将数据存储到localStorage中
    LocalStorageManager.set = function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    };
    // 定义一个静态方法，用于从localStorage中删除存储的数据
    LocalStorageManager.remove = function (key) {
        localStorage.removeItem(key);
    };
    return LocalStorageManager;
}());
/*
// 使用示例：
// 存储数据
LocalStorageManager.set('name', 'Tom');
LocalStorageManager.set('age', 20);
// 获取数据
const tname = LocalStorageManager.get('name');
const age = LocalStorageManager.get('age');
// 删除数据
LocalStorageManager.remove('age');
*/ 
