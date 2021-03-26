import React from 'react';
import Calendar from '../components/Calendar';
import HomeNavBar from '../components/HomeNavBar';
import AddEvent from '../components/AddEvent';
import {useState} from 'react';

const HomePage = () =>
{
        const [value, onChange] = useState(new Date()); 
        console.log(value);    
    return(
    <div>
        <AddEvent />
        <Calendar/>
        <HomeNavBar />     
    </div>
        
    );
};

export default HomePage;