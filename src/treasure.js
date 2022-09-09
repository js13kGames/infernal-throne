import * as bus from './bus';
import { scaleInPlace } from './canvas';
import { renderMesh } from './canvas';
import { BoundingBox } from './bbox';
import { inView } from './utils';
import { EVENT_ATTACK, EVENT_ATTACK_HIT, EVENT_BONE_SPAWN } from './events';
import HealthSystem from './hp';

// Values -> 20, 50, 100
// Hp -> 3, 6, 9 (1 bone each)
const boneMap = [7, 14, 11];
const skullMap = [1, 3, 7];
const colorMap = ['#a63', '#889', '#db1'];
const bgColorMap = ['#742', '#667', '#b90'];

function Treasure(x, y, t) {
    y += 50;
    let hitTimer = 0;
    let phase = 0;
    const myHitbox = new BoundingBox(x-25,y-55,0,0,50,55);

    const baseColor = colorMap[t-1];
    const bgColor = bgColorMap[t-1];
    const treasureMesh = [
        [baseColor, 8, 0],
        [20, 0, -20, 0, -28, -23, 28, -23, 20, 0],
        [baseColor, 8, 0],
        [-28, -23, -24, -40, 24, -40, 28, -23],
        ['#ffa', 8, 0],
        [0, -27, 0, -19],
    ];

    function update(dT) {
        hitTimer = Math.max(hitTimer - dT, 0);
        return hp.g() <= 0;
    }

    function render(ctx) {
        const decay = Math.exp(hitTimer * 6 - 3);
        const dy = 2 + Math.abs(Math.cos(hitTimer * 20) * 12) * decay / 10;
        const da = Math.cos(hitTimer * 30 + phase) * hitTimer * decay / 60;
        const xfm = ctx.getTransform();
        scaleInPlace(0.75 + t * 0.15, x, y);
        renderMesh(treasureMesh, x, y - dy, 0, 0, da, bgColor);
        ctx.setTransform(xfm);
    }

    function onHitCallback() {
        hitTimer = 1;
        phase = Math.random() * 7;
        bus.emit(EVENT_BONE_SPAWN, [x,y-20,1,1]);
        if (hp.g() <= 0) {
            bus.emit(EVENT_BONE_SPAWN, [x,y-20, boneMap[t-1], 1]);
            bus.emit(EVENT_BONE_SPAWN, [x,y-20, skullMap[t-1], 2]);
        }
    }

    const hp = new HealthSystem(3 * t, myHitbox, onHitCallback);

    return {
        update,
        render,
        enable: hp.e,
        disable: hp.d,
        inView: (cx, cy) => inView(x, y, cx, cy),
        order: -6000,
    }
}

export default Treasure;