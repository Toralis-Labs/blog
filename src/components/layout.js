import React from 'react'

import Footer from './footer'
import './global.css'
import Header from './header'
import Seo from './seo'
import './variables.css'

class Template extends React.Component {
  render() {
    const { children } = this.props

    return (
      <>
        <Seo />
        <Header />
        <main className='page-inner-wrapper '>{children}</main>
        <Footer />
      </>
    )
  }
}

export default Template
