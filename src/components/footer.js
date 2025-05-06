import React from 'react'


export default function Footer() {
  return (
    <footer style={FooterWrapper} >
      <div className='footer-inner-wrap '>
        <section>
          a Footer
          <div className='footer-icon'>
            <p>© 2025 Radiel Health. All rights reserved.</p>
          </div>
        </section>

      </div>
    </footer>
  )
}

const FooterWrapper = {
  background: "black",
  width: "100%",
  color: "white"
}
