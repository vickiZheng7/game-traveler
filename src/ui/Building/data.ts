export interface BuildingInfo {
    name: string;
    x: number;
    y: number;
    /** 默认250 */
    width?: number;
    /** 默认250 */
    height?: number;
}

export const buildingImage = "resources/map/building.png";

export const buildingInfos: BuildingInfo[] = [
    { name: '西餐厅', x: 0, y: 0 },
    { name: '音响店', x: 250, y: 0 },
    { name: 'ktv', x: 500, y: 0 },
    { name: '酒吧', x: 750, y: 0 },
    { name: '咖啡店', x: 0, y: 250 },
    { name: '火锅店', x: 250, y: 250 },
    { name: '健身房', x: 500, y: 250 },
    { name: '电影院', x: 750, y: 250 },
    { name: '游乐园', x: 0, y: 500 },
    { name: '茶馆',x: 250, y: 500 },
    { name: '巴西烤肉', x: 500, y: 500 },
    { name: '豪华海鲜饭店', x: 750, y: 500 },
    { name: '豪华西餐厅', x: 0, y: 750 },
    { name: '鲜花店', x: 250, y: 750 },
    { name: '医院', x: 500, y: 750 },
    { name: '洗衣机', x: 750, y: 750 },
];