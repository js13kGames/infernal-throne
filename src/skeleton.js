import { color, renderMesh, scaleInPlace } from './canvas';
import * as bus from './bus';

function Skeleton(x, y, type) {
    const thickness = 5;
    const size = 1.3;
    let anim = 0;
    let vx = 0;
    let targetFacing = 1;
    let facing = 1;
    let injured = 0;
    let maxHp = 3;
    let hp = maxHp;

    const bodyMesh = [
        ['#fff', thickness, 0],
        [0, -13, 4, -29, 13, -40],
        [0, -16, -2, -17],
        [2, -22, -3, -24],
        [4, -28, 0, -30],
        [6, -33, 4, -35],
    ];
    const legMesh = [
        ['#fff', thickness, 0],
        [-8, 0, 0, -13, 8, 0],
    ];
    const handMesh = [
        ['#fff', thickness, 0],
        [0, 0, 14, 15]
    ];
    const headMesh = [
        ['#fff', 9, 0],
        [3, 10, -3, 10, -3, 0, -6, -4, 0, -10, 6, -4, 3, 0, 3, 10],
        ['#000', 4, 5],
        [-5, -6, -3, -5],
        [5, -6, 3, -5],
    ];

    function update(dT) {
        if (hp <= 0) {
            return true;
        }
        
        if (injured <= 0) {
            vx = 60 * facing;
            if (Math.random > 0.98) {
                targetFacing = -targetFacing;
            }
        }

        if (injured > 0) {
            vx -= vx * 12 * dT;
        }

        anim += dT;
        x += vx * dT;
        facing += (targetFacing - facing) * 20 * dT;
        injured = Math.max(0, injured - dT * 2);
    }

    function render(ctx) {
        const idle = 0;
        const walking = 1;

        const t = facing * 0.6;
        const a = anim * 6;
        const xfm = ctx.getTransform();
        scaleInPlace(size, x, y);

        const pBodyP = (Math.cos(a) / 20) * walking - facing * injured * 0.3;
        const pHand1X = 7 * t * (idle + walking) + pBodyP * 50;
        const pHand1Y = 
            (-33 - 2 * t + Math.cos(a)) * idle +
            (-33 - 2 * t + Math.cos(a-1)) * walking;
        const pHand2X = 7 * t * (idle + walking) + pBodyP * 50;
        const pHand2Y =
            (-33 + 2 * t + Math.cos(a)) * idle +
            (-33 + 2 * t + Math.cos(a+2)) * walking;
        const pHeadY = (-40 + Math.cos(a+1)) * (idle + walking);
        
        // Leg animation
        legMesh[1][0] = -8 * idle + (Math.cos(a) * 8 * facing) * walking;
        legMesh[1][1] = (Math.min(0, Math.sin(a)) * 4) * walking;
        legMesh[1][4] = -8 * idle + (Math.cos(a+3) * 8 * facing) * walking;
        legMesh[1][5] = (Math.min(0, Math.sin(a+3)) * 4) * walking;

        if (injured > 0.2) {
            ctx.globalAlpha = Math.cos(injured*25) > 0 ? 0.2 : 1;
        }
        renderMesh(legMesh, x, y, 0, t, 0);
        renderMesh(handMesh, x + pHand1X, y + pHand1Y, -4, t * 2.1, -t/3);
        renderMesh(handMesh, x + pHand2X, y + pHand2Y, 4, t * 2.1 + 3.14, -t/3);
        renderMesh(bodyMesh, x, y, 0, t * 2 - 1.57, pBodyP);
        renderMesh(headMesh, x, y + pHeadY, 23 + pBodyP * 70 * facing, -t, -injured * facing * 0.6);
        ctx.globalAlpha = 1;
        ctx.setTransform(xfm);
    }

    function hitCheck([bbox, dir]) {
        if (bbox.isAABB(x-20, y-55,40,55)) {
            vx = dir * 600;
            targetFacing = -Math.sign(dir);
            injured = 1;
            hp -= 1;
        }
    }
    bus.on('attack', hitCheck);

    return {
        update,
        render,
        order: 500,
    };
}

export default Skeleton;