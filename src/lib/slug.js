let slug = (text) => {
  return text.toLowerCase()
    .replace(/[^\w ]+/g,'')
    .replace(/ +/g,'-');
};

export default slug;
