// Return index of first match in an array
const matches = (array, value) => {
  let match = -1;

  array.some((element, index) => {
    if (element.match(value)) {
      match = index;
      return true;
    }

    return false;
  });

  return match;
};

export default matches;
