import React from "react";
import "./Footer.css";

function Footer() {
    return (
        <footer className="main-footer">
            <p>&copy; {new Date().getFullYear()} Golf deildin </p>
        </footer>
    );
}

export default Footer;