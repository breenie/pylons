const { cameras } = require("./_data/site.json");
const images = require("../data/images.json");
const sort = (a, b) => new Date(b.LastModified) - new Date(a.LastModified);
const { DateTime } = require("luxon");

/**
 * Create a permalink for an image based on camera and date format
 * @param {Object} param0 Object containing camera and image
 * @param {string} format Date format string
 * @returns {string} Permalink string
 */
const createPermalink = ({ camera, image }, format) => {
  return (
    camera.id +
    "/" +
    DateTime.fromJSDate(new Date(image.LastModified)).toFormat(format)
  );
};

/**
 * Get processed image data
 * @param {string} format Date format for grouping images
 * @returns {Array} Processed image data
 */
const getData = (format) => {
  const everything = images.sort(sort).map((image) => ({
    image,
    camera: cameras.find((c) => image.Key.match(new RegExp(c.pattern)))
  }));

  const collection = everything.reduce((acc, item) => {
    const id = createPermalink(item, format);
    if (!acc[id]) {
      acc[id] = item;
    }
    return acc;
  }, {});

  const grouped = {};

  Object.keys(collection).forEach((key) => {
    const groupKey = key.replace(/\/[^/]+$/, "");
    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(collection[key]);
  });

  return Object.keys(grouped).map((key) => ({
    images: grouped[key].sort(sort),
    camera: grouped[key][0].camera,
    permalink: key + "/"
  }));
};

module.exports = {
  getData
};
