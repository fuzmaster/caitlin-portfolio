const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "sitemap.xml": "sitemap.xml" });
  eleventyConfig.addPassthroughCopy({ "favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "apple-touch-icon.png": "apple-touch-icon.png" });
  eleventyConfig.addPassthroughCopy({ "src/assets/build": "assets/build" });

  eleventyConfig.addFilter('jsonStringify', (value) => JSON.stringify(value));

  eleventyConfig.addFilter('assetUrl', (logicalPath) => {
    const manifestPath = path.join(process.cwd(), 'src', '_data', 'asset-manifest.json');
    if (!fs.existsSync(manifestPath)) {
      return `/${logicalPath}`;
    }

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      return `/${manifest[logicalPath] || logicalPath}`;
    } catch {
      return `/${logicalPath}`;
    }
  });

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site'
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    templateFormats: ['njk', 'html', 'md']
  };
};
