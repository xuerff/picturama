let slug = text => text.toLowerCase()
  .replace(/[^\w ]+/g, '')
  .replace(/ +/g, '-');

export default slug;
