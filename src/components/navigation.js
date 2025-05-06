import React from 'react'
import { Link } from 'gatsby'
import WhiteIcon from '../images/logos/white_icon.svg'

const Navigation = () => (
  <Link to="/">
    <nav >
      <img src={WhiteIcon} alt="Nav Icon" />
    </nav>
  </Link>
)




export default Navigation
