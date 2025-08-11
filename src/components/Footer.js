import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p className="copyright">© {new Date().getFullYear()} Pochagram - Instagram風健康SNSアプリ</p>
      </div>
    </footer>
  );
};

export default Footer;