import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import React from 'react'
import Layout from '../components/layout'
import Seo from '../components/seo'

const BlogPost = ({ data }) => {
  const post = data.contentfulPost

  return (
    <Layout>
      <Seo
        title={post.title}
        description={post.description?.raw}
      />
      <article className="article-writeup">
        <header className="article-page-header">
          <h1 className="article-page-header-title">{post.title}</h1>
          <div className="article-page-header-info-bar">
            <span>{post.publishDate}</span>
            <span>{post.readTime} min read</span>
          </div>
        </header>
        
        {post.heroImage && (
          <GatsbyImage
            image={post.heroImage.gatsbyImageData}
            alt={post.title}
            style={{ marginBottom: '2rem' }}
          />
        )}
        
        {post.body?.raw && renderRichText(post.body)}
      </article>
    </Layout>
  )
}

export default BlogPost

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    contentfulPost(slug: { eq: $slug }) {
      title
      publishDate(formatString: "MMMM Do, YYYY")
      readTime
    }
  }
` 