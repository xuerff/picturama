import { PhotoEffect } from '../models/Photo'


export type DetailState = { effects: PhotoEffect[] } | null


export default function detail(state, action) {
    switch (action.type) {
    case 'GET_PHOTOS_SUCCESS':
        return {
            ...state,
            detail: null
        }
    case 'SET_CURRENT_SUCCESS':
    case 'SET_CURRENT_LEFT_SUCCESS':
    case 'SET_CURRENT_RIGHT_SUCCESS':
        return {
            ...state,
            detail: { effects: [] }
        }
    case 'EDIT_ROTATE':
        return {
            ...state,
            detail: { effects: rotate(state.detail.effects, action.turns) }
        }
    default:
        return state;
    }
}


function rotate(prevEffects: PhotoEffect[], turns: number): PhotoEffect[] {
    if (!prevEffects) {
        return prevEffects
    }

    const nextEffects = []
    let hadRotateEffect = false
    for (const prevEffect of prevEffects) {
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
