set wildignore+=dist/*,tests-dist/*,build/*

let g:ctrlp_custom_ignore = 'dist'
let g:jsx_ext_required = 0

" Babel es6 support
let g:syntastic_javascript_checkers = ['eslint']
