const processTags = (prevTags, nextTags) => {
  let tags = nextTags.map((nextTag) => {
    let exists = false;

    prevTags.forEach((prevTag) => {
      if (nextTag.slug == prevTag.slug)
        exists = true;
    });

    return (!exists) ? nextTag : null;
  })
  .filter((tag) => tag);

  return (tags.length > 0) ? prevTags.concat(tags) : [];
};

const initialState = {
  tags: []
};

export default (state = initialState, action) => {
  switch (action.type) {
  case 'GET_TAGS_SUCCESS':
    console.log('get tags', state, action.tags);
    return {
      ...state,
      tags: action.tags
    };

  case 'CREATE_TAGS_SUCCESS':
    return {
      ...state,
      tags: processTags(state.tags, action.tags)
    };

  default:
    return state;
  }
};
