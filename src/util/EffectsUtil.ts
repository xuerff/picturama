import { PhotoWork } from "../models/photo"


export function rotate(photoWork: PhotoWork, turns: number) {
    const newRotationTurns = ((photoWork.rotationTurns || 0) + turns + 4) % 4
    if (newRotationTurns === 1 || newRotationTurns === 2 || newRotationTurns === 3) {
        photoWork.rotationTurns = newRotationTurns
    } else {
        delete photoWork.rotationTurns
    }
}
