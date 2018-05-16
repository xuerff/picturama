export const openExport = () => dispatch => {
    dispatch({ type: 'OPEN_EXPORT' })
}

export const closeExport = () => dispatch => {
    dispatch({ type: 'CLOSE_EXPORT' })
}
