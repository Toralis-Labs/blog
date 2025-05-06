import { graphql, Link } from 'gatsby';
import get from 'lodash/get';
import React from 'react';

import Layout from '../components/layout';

import Seo from '../components/seo';

const IndexPage = (props) => {
  const posts = get(props, 'data.allContentfulPost.nodes')

  console.log(posts)

  return (
    <Layout location={props.location}>
      <Seo
        title='Radiel Health'
        description='Blog by Radiel Health'
      />
      <h1>Radiel Health</h1>

      {posts.map((post) => (
        <Link to={`/${post.slug}`} key={post.id}>
          <div key={post.id}>
            <h2>Title: {post.title}</h2>
            <p>Subtitle: {post.subtitle.subtitle}</p>
          </div>
        </Link>
      ))}
    </Layout >
  )
}

export default IndexPage

export const Head = () => <title>Home Page</title>

export const pageQuery = graphql`
  query HomeQuery {
    allContentfulPost {
      nodes {
        publishDate
        readTime
        slug
        title
        createdAt
        subtitle {
          subtitle
        }
        id
      }
    }
  }
`