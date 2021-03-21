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
