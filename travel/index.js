import MapAction from "./mapAction.js";
import prompt from 'prompt';
const map = new MapAction();
prompt.start();
while (true) {
    try {
        const result = await prompt.get(['new Position']);
        map.positionChange(result['new Position']);
        if (map.isFinish) break;

    }
    catch (ex) {
    }
}