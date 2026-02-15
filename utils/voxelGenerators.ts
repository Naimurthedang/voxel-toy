
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../types';
import { COLORS, CONFIG } from './voxelConstants';

function setBlock(map: Map<string, VoxelData>, x: number, y: number, z: number, color: number) {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rz = Math.round(z);
    const key = `${rx},${ry},${rz}`;
    map.set(key, { x: rx, y: ry, z: rz, color });
}

function generateSphere(map: Map<string, VoxelData>, cx: number, cy: number, cz: number, r: number, col: number, sy = 1) {
    const r2 = r * r;
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        for (let y = Math.floor(cy - r * sy); y <= Math.ceil(cy + r * sy); y++) {
            for (let z = Math.floor(cz - r); z <= Math.ceil(cz + r); z++) {
                const dx = x - cx;
                const dy = (y - cy) / sy;
                const dz = z - cz;
                if (dx * dx + dy * dy + dz * dz <= r2) setBlock(map, x, y, z, col);
            }
        }
    }
}

export const Generators = {
    Eagle: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        for (let x = -8; x < 8; x++) generateSphere(map, x, Math.sin(x*0.2)*1.5, Math.cos(x*0.1)*1.5, 1.8, COLORS.WOOD);
        generateSphere(map, 0, 8, 2, 4.5, COLORS.DARK, 1.4);
        generateSphere(map, 0, 14, 3, 2.8, COLORS.WHITE);
        return Array.from(map.values());
    },

    Rattle: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        // Handle
        for (let y = -4; y < 4; y++) generateSphere(map, 0, y, 0, 1.2, COLORS.WOOD);
        // Rings
        generateSphere(map, 0, 6, 0, 3.5, COLORS.GOLD);
        generateSphere(map, 0, 6, 0, 2.0, 0xffffff); // Inner clear/white
        // Small balls inside
        setBlock(map, 1, 6, 1, COLORS.DARK);
        setBlock(map, -1, 6, -1, COLORS.TALON);
        return Array.from(map.values());
    },

    Cradle: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        // Base
        for (let x = -6; x <= 6; x++) for (let z = -4; z <= 4; z++) setBlock(map, x, 0, z, COLORS.WOOD);
        // Sides
        for (let x = -6; x <= 6; x++) {
            for (let y = 1; y < 5; y++) {
                setBlock(map, x, y, -4, COLORS.WOOD);
                setBlock(map, x, y, 4, COLORS.WOOD);
            }
        }
        for (let z = -4; z <= 4; z++) {
            for (let y = 1; y < 8; y++) {
                setBlock(map, -6, y, z, COLORS.WOOD);
                setBlock(map, 6, y, z, COLORS.WOOD);
            }
        }
        // Mattress
        for (let x = -5; x <= 5; x++) for (let z = -3; z <= 3; z++) setBlock(map, x, 1, z, COLORS.WHITE);
        return Array.from(map.values());
    },

    Cat: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        generateSphere(map, 0, 5, 0, 4, COLORS.DARK);
        generateSphere(map, 0, 11, 0, 3, COLORS.DARK);
        return Array.from(map.values());
    },

    Rabbit: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        generateSphere(map, 0, 3, 0, 3.5, COLORS.WHITE);
        generateSphere(map, 0, 8, 0, 2.5, COLORS.WHITE);
        return Array.from(map.values());
    },

    Twins: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        generateSphere(map, -5, 5, 0, 3, COLORS.GOLD);
        generateSphere(map, 5, 5, 0, 3, COLORS.DARK);
        return Array.from(map.values());
    }
};
