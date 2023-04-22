export class LocalStorage {
    static setItem(key: string, value: any) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static getItem(key: string) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }

    static removeItem(key: string) {
        localStorage.removeItem(key);
    }

    static clear() {
        localStorage.clear();
    }
}

export let testID = "test";