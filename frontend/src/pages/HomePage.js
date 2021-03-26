import React from 'react';
import Calendar from '../components/Calendar';
import HomeNavBar from '../components/HomeNavBar';
import AddEvent from '../components/AddEvent';
import { Component } from 'react';


const HomePage = () =>
{

    return(
    <div>
        <AddEvent />
        <Calendar/>
        <HomeNavBar />     
    </div>
        
    );
};

export default HomePage;