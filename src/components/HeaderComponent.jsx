import React from 'react'
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import '../assets/styles/HeaderComponent.css';

const HeaderComponent = () => {
  return (
    <header className="header">
      <Link to="/" className="header-link">
        <img src={logo} alt="WallyStreet Logo" className="header-logo"/>
        <h1 className="header-title">WallyStreet</h1>
      </Link>
    </header>
  );
}

export default HeaderComponent