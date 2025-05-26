import { graphql } from 'gatsby';
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

      <section class="blog-area-7">
          <div class="container">
            <div class="work-area-7-inner section-spacing">
              <div class="section-content-wrapper">
                <div class="main-content">
                  <div class="blogs-wrapper-box fade-anim">
                    <div class="blogs-wrapper-main">
                      {posts.map((post) => (
                      <article class="blog fade-anim">
                        <div class="thumb">
                          <a href={`/${post.slug}`}><img src={post.coverImage ? post.coverImage.url : ''} alt="image" /> </a>
                        </div>
                        <div class="content-wrapper">
                          <div class="content">
                            <div class="meta">
                              <span class="date">{post.publishDate}</span>
                              <span class="comments">{post.readTime} min read</span>
                            </div>
                            <h2 class="title"><a href={`/${post.slug}`}>{post.title}</a>
                            </h2>
                            <div class="text">{post.subtitle.subtitle}</div>
                            <a class="t-btn t-btn-primary" href={`/${post.slug}`}>Read More</a>
                          </div>
                        </div>
                      </article>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
    </Layout >
  )
}

export default IndexPage

export const Head = () => <title>Home Page</title>

export const pageQuery = graphql`
  query HomeQuery {
    allContentfulPost {
      nodes {
        publishDate(formatString: "MMMM Do, YYYY")
        readTime
        slug
        title
        createdAt
        subtitle {
          subtitle
        }
        id
        coverImage {
          url
        }
      }
    }
  }
`