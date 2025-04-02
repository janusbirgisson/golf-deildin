import React from "react";

function Footer() {
    return (
        <footer className="w-full bg-primary text-white p-6 text-center">
            <p>&copy; {new Date().getFullYear()} Golfdeildin </p>
        </footer>
    );
}

export default Footer;