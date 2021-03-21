const path = require(`path`);

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;
  const result = await graphql(`
    query {
      allMosaicsJson {
        nodes {
          name
        }
      }
    }
  `);

  result.data.allMosaicsJson.nodes.forEach(({ name }) => {
    createPage({
      path: `view/${name}`,
      component: path.resolve(`./src/pages/index.tsx`),
      context: { name },
    });
  });
};

exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  if (stage === "build-html" || stage === "develop-html") {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /openseadragon/,
            use: loaders.null(),
          },
        ],
      },
    })
  }
}