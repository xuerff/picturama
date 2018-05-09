
export const editRotate = (turns: number) => dispatch => {
    dispatch({
        type: 'EDIT_ROTATE',
        turns
    })
}
