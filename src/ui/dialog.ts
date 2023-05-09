
export class MyDialog extends Laya.Dialog {
    constructor(str: string) {
        super();
        // 设置对话框的大小、背景、关闭按钮等
        this.size(100, 100);

        // 在对话框中添加UI组件
        const label = new Laya.Label();
        label.text = str;
        label.fontSize = 20;
        label.color = "#000000";
        label.pos(this.width / 2 - label.width / 2, this.height / 2 - label.height / 2);
        this.addChild(label);
    }
}
