import React from 'react'
import { Link } from 'gatsby'


export default function ArticleCard({ title, slug, topic, date, read_time, icon }) {

    return (
        <div className="article-card">
            <Link className="article-card-inner-wrapper" to={`/${slug}`}>
                <div className='article-card-title-wrapper'>
                    <div>
                        <img src={icon} alt="article icon" style={iconStyle} className="article-card-icon" />
                    </div>
                    <div>
                        <h1 style={header}>{title}</h1>
                    </div>
                </div>
                <ul className='article-card-info-wrapper'>
                    <li className='article-card-info-item'>{date}</li>
                    <li className='article-card-info-item'>{topic}</li>
                    <li className='article-card-info-item'>{read_time} mins</li>
                </ul>
            </Link>
        </div>
    )
}


const header = {
    margin: 0,
    fontSize: '28px',
    fontWeight: '500',
    lineHeight: '125%',
    fontFamily: 'Poppins, sans-serif'
}

const iconStyle = {
    marginTop: '4px',
    height: '18px',

}

