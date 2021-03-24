/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
 */

module.exports = {
  /* Your site config here */
  plugins: [
    "gatsby-plugin-dts-css-modules",
    "gatsby-transformer-json",
    "gatsby-plugin-react-helmet",
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `mosaics`,
        path: `${__dirname}/content/mosaics.json`,
      },
    },
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        rule: {
          include: /icons/
        },
      },
    },
  ],
};
