// src/components/PrivateLayout.jsx
import Navbar from './Navbar';

export default function PrivateLayout({ children }) {
    return (
        <div className="d-flex flex-column min-vh-100 w-100">
            <Navbar />
            <main className="flex-grow-1 bg-light" style={{ paddingTop: '110px' }}>
                {children}
            </main>
        </div>
    );
}