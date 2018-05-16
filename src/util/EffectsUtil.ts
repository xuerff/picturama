import { PhotoEffect } from "../models/photo"


export function rotate(effects: PhotoEffect[], turns: number): PhotoEffect[] {
    const nextEffects = []
    let hadRotateEffect = false
    for (const prevEffect of effects) {
        if (prevEffect.type === 'rotate') {
            const nextTurns = (prevEffect.turns + turns + 4) % 4
            if (nextTurns !== 0) {
                nextEffects.push({ type: 'rotate', turns: (prevEffect.turns + turns + 4) % 4 })
            }
            hadRotateEffect = true
        } else {
            nextEffects.push(prevEffect)
        }
    }

    if (!hadRotateEffect) {
        // Make the rotate effect the first effect
        nextEffects.splice(0, 0, { type: 'rotate', turns: (turns + 4) % 4 })
    }

    return nextEffects
}
