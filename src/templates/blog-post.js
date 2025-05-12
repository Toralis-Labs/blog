import { graphql, Link } from 'gatsby'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import Layout from '../components/layout'
import Seo from '../components/seo'


import '../assets/vendor/all.min.css'
import '../assets/vendor/animate.min.css'
import '../assets/vendor/bootstrap.min.css'
import '../assets/vendor/magnific-popup.css'
import '../assets/vendor/meanmenu.min.css'
import '../assets/vendor/nice-select.css'
import '../assets/vendor/progressbar.css'
import '../assets/vendor/swiper-bundle.min.css'

import '../assets/css/style.css'

const BlogPost = ({ data }) => {
  const post = data.contentfulPost

  console.log(post)

  return (
    <Layout>
      <Seo
        title={post.title}
        description={post.description?.raw}
      />
      <Link to="/">Back to Home</Link>
      <main>
        <section class="blog-area-7">
          <div class="container">
            <div class="work-area-7-inner section-spacing">
              <div class="section-content-wrapper">
                <div class="main-content">
                  <div class="blog-details-wrapper fade-anim">
                    <article class="blog-details">
                      <h2 class="title main">{post.title}</h2>
                      <br />
                      <h4 style={{ fontSize: '1.75rem', fontWeight: 400, opacity: 0.75 }}>{post.subtitle.subtitle}</h4>
                      <br />
                      <div class="meta">
                        <span class="date">{post.publishDate}</span>
                        <span class="comments">{post.readTime} min read</span>
                      </div>
                      <div>
                        {post.content?.content ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '')
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  children={String(children).replace(/\n$/, '')}
                                  style={atomDark}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                  codeTagProps={{ className: "custom-code-snippet" }}
                                />
                              ) : (
                                <code className=" inline-code-snippet" {...props} >
                                  {children}
                                </code>
                              )
                            },
                            blockquote({ children }) {
                              return (
                                <div className='quote-text'>
                                  <p className='text'>{children}</p>
                                </div>
                              )
                            },
                            h1({ children }) {
                              return (
                                <h1 id={get_header_id(children)}>{children}</h1>
                              )
                            },
                            h2({ children }) {
                              return (
                                <div className='details-info'>
                                  <h2 className='title' id={get_header_id(children)}>{children}</h2>
                                </div>
                              )
                            },
                            h3({ children }) {
                              return (
                                <h3 id={get_header_id(children)}>{children}</h3>
                              )
                            }
                          }}>
                            {post.content.content}
                          </ReactMarkdown>
                        ) : (
                          <p>No content available</p>
                        )}
                      </div>

                      


                      <div class="tags-and-share">
                        <div class="tags-wrapper">
                          <span class="title">Tags:</span>
                          <div class="tags">
                            <a href="#">Branding</a>
                            <a href="#">Design</a>
                            <a href="#">Corporate</a>
                          </div>
                        </div>
                        <div class="social-wrapper">
                          <p class="title">Share:</p>
                          <div class="social-links">
                            <a href="#"><i class="fa-brands fa-facebook-f"></i></a>
                            <a href="#"><i class="fa-brands fa-twitter"></i></a>
                            <a href="#"><i class="fa-brands fa-linkedin-in"></i></a>
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </Layout>
  )
}


function get_header_id(data) {
  let headerString = ""
  if (typeof data === 'object') {
    let formatted_data = data.map((item) => {
      if (typeof item === 'object') {
        item = item.props.children.join(" ")
      }
      return item
    });
    headerString = formatted_data.join(" ")
  } else if (typeof data === 'string') {
    headerString = data
  }

  let id_string = headerString.replace(/\s+/g, '-').toLowerCase()
  console.log(id_string)
  return id_string
}

export default BlogPost

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    contentfulPost(slug: { eq: $slug }) {
      title
      publishDate(formatString: "MMMM Do, YYYY")
      readTime
      subtitle {
        subtitle
      }
      content {
        content
      }
    }
  }
` 