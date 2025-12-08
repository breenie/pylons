const path = require("node:path");
const sass = require("sass");
const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  // Pass through images (optional if using S3)
  //eleventyConfig.addPassthroughCopy("src/images");

  // Collections per pylon
  const { cameras: pylons } = require("./src/_data/site.json");
  pylons.forEach(({ id, ...pylon }) => {
    eleventyConfig.addCollection(`pylon${id}`, function (collectionApi) {
      const data = require(`./data/images.json`);

      return data
        .sort((a, b) => new Date(a.LastModified) - new Date(b.LastModified))
        .map((item) => ({
          data: item // becomes item.data in templates
        }));
    });
  });

  ["src/css", "src/js", "src/img"].forEach((path) => {
    eleventyConfig.addPassthroughCopy(path);
  });

  eleventyConfig.addFilter("console", function (value) {
    return `<div style="white-space: pre-wrap;">${JSON.stringify(
      value,
      null,
      2
    )}</div>;`;
  });

  eleventyConfig.addFilter("date", (dateObj, format = "yyyy-MM-dd HH:mm") => {
    // dateObj can be JS Date or ISO string
    return DateTime.fromJSDate(new Date(dateObj)).toFormat(format, {
      zone: "Europe/London"
    });
  });

  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",

    // opt-out of Eleventy Layouts
    useLayouts: false,

    compile: async function (inputContent, inputPath) {
      let parsed = path.parse(inputPath);
      // Don’t compile file names that start with an underscore
      if (parsed.name.startsWith("_")) {
        return;
      }

      let result = sass.compileString(inputContent, {
        loadPaths: [parsed.dir || ".", this.config.dir.includes]
      });

      // Map dependencies for incremental builds
      this.addDependencies(inputPath, result.loadedUrls);

      return async (data) => {
        return result.css;
      };
    }
  });

  eleventyConfig.addTemplateFormats("scss");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes"
    },
    passthroughFileCopy: true
  };
};
