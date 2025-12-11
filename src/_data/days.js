const { getData, reverseImages } = require("../images");

module.exports = () => {
  return getData("yyyy/MM/dd").map(reverseImages).reverse();
};
