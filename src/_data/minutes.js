const { getData, reverseImages } = require("../images");

module.exports = () => {
  return getData("yyyy/MM/dd/HHmm").map(reverseImages).reverse();
};
