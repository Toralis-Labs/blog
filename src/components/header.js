import React from 'react'
import logo from '../images/logo.png'



export default function Header() {
  return (
    <div>
    <header class="header-area-5">
        <div class="header-main header-sticky">
            <div class="container large">
                <div class="header-area-5-inner">
                <div class="header-logo">
                    <a href="/">
                    <img src={logo} class="normal-logo" alt="Site Logo"/>
                    </a>
                </div>
                <div class="header-nav">
                    <nav class="main-menu" style={{display: 'block', color: 'black'}}>
                    
                    </nav>
                </div>
                <div class="header-button">
                    <div class="t-btn-group">
                    <a class="t-btn t-btn-circle" href="mailto:hello@radielhealth.com">
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                    <a class="t-btn t-btn-primary" href="mailto:hello@radielhealth.com">Let's Connect</a>
                    <a class="t-btn t-btn-circle" href="mailto:hello@radielhealth.com">
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                    </div>
                </div>
                <div class="header-offcanvas d-xl-none">
                    <button class="side-toggle">
                    <i class="fa-solid fa-bars"></i></button>
                </div>
                </div>
            </div>
        </div>
    </header>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    </div>
  )
}
