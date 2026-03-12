// src/components/PublicLayout.jsx
export default function PublicLayout({ children }) {
    return (
        <div className="d-flex flex-column min-vh-100 w-100" style={{ minWidth: '100vw' }}>
            <main className="flex-grow-1 d-flex align-items-center justify-content-center bg-light">
                {children}
            </main>
        </div>
    );
}