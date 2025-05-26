import React from 'react'


export default function Footer() {
  return (
    <footer class="footer-area">
      <div class="area-bg">
        <img src="assets/imgs/gallery/image-8.webp" alt="image"/>
      </div>
      <div class="container">
        <div class="footer-widget-wrapper-box">
          <div class="footer-widget-wrapper">
            <div class="footer-widget-box newsletter">
              <div class="subscription-box">
                <div class="title-wrapper">
                  <h2 class="section-title">Radiel Health</h2>
                </div>
                <div class="text-wrapper">
                  <p class="text">Predictive blood flow for surgical planning.</p>
                </div>
              </div>
            </div>
            <div></div>
            <div></div>
            <div class="footer-widget-box">
              <h2 class="title">Company</h2>
              <ul class="footer-nav-list">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Our Blogs</a></li>
                <li><a href="#">Our Works</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>
            
            
          </div>
        </div>
      </div>
      <div class="copyright-area">
        <div class="container">
          <div class="copyright-area-inner">
            <div class="footer-logo">
              
            </div>
            <div class="copyright-text">
              <p class="text">Copyright © {new Date().getFullYear()} Radiel Health. All rights reserved.</p>
            </div>
            <div class="social-links">
              
            </div>
          </div>
        </div>
      </div>
    </footer>

  )
}
