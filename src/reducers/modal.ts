export default function reducers(state, action) {
    switch (action.type) {
        case 'TOGGLE_DIFF_SUCCESS':
            return {
                ...state,
                modal: (state.modal === 'diff') ? null : 'diff'
            }

        case 'OPEN_EXPORT':
            return {
                ...state,
                modal: 'export'
            }

        case 'CLOSE_EXPORT':
            return {
                ...state,
                modal: null
            }

        default:
            return state
    }
}
