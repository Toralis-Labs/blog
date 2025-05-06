const path = require('path')

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const result = await graphql(`
    query {
      allContentfulPost {
        nodes {
          slug
        }
      }
    }
  `)

  result.data.allContentfulPost.nodes.forEach((post) => {
    createPage({
      path: `/${post.slug}`,
      component: path.resolve('./src/templates/blog-post.js'),
      context: {
        slug: post.slug,
      },
    })
  })
} 