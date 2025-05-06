import React, { useEffect, useState } from 'react';

import SearchIcon from '../images/search_icon.svg';


export default function Search({ topics, setSelectedTitle, selectedTitle, setSelectedTopics }) {
    const [topicSelect, setTopicSelect] = useState([]);
    const [title, setTitle] = useState(selectedTitle);

    useEffect(() => {
        setTopicSelect(new Array(topics.length).fill(false))
        console.log(topics)
    }, []);


    const handleOnChange = (position) => {
        console.log(position)
        const updatedCheckedState = topicSelect.map((item, index) =>
            index === position ? !item : item
        )

        setTopicSelect(updatedCheckedState);
    };

    const onSearch = (e) => {
        // get array of selected topics
        const selectedTopics = topicSelect.map((selected, i) => selected ? topics[i].title : null).filter(topic => topic != null)
        setSelectedTopics(selectedTopics)
        setSelectedTitle(title)
    };

    return (
        <>
            <div className='search-bar-wrapper'>
                <div className='search-bar-button-wrapper'>
                    <button type='submit' className='search-bar-button' onClick={onSearch}><img src={SearchIcon} alt="search" /></button>
                </div>

                <input type="text" placeholder='Search by Title' className='search-bar-box' value={title} onChange={e => setTitle(e.target.value)} onKeyUp={e => e.key === 'Enter' ? onSearch(e) : null} />
            </div>
            <div className='search-checkbox-grid'>
                {
                    topics && topics.map((topic, i) =>
                        <div key={i} className='search-checkbox-item'>
                            <input type="checkbox" id={`search-checkbox-${i}`} />
                            <label htmlFor={`search-checkbox-${i}`}>{topic.title}</label>
                        </div>
                    )
                }
            </div>
        </>
    )
}

