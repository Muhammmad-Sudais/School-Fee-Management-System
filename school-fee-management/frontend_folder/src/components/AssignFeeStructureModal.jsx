// src/components/AssignFeeStructureModal.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AssignFeeStructureModal({ studentId, studentName, onClose, onAssign }) {
    const [feeStructures, setFeeStructures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStructure, setSelectedStructure] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFeeStructures = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/fee-structures');
                setFeeStructures(res.data);
            } catch (err) {
                setError('Failed to load fee structures');
            } finally {
                setLoading(false);
            }
        };
        fetchFeeStructures();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStructure) {
            alert('Please select a fee structure');
            return;
        }

        try {
            await axios.post(`http://localhost:5000/api/fee-structures/assign/${studentId}`, {
                feeStructureId: selectedStructure
            });
            onAssign();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to assign fee structure');
        }
    };

    return (
        <>
            <div className="modal show d-block" tabIndex="-1">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Assign Fee Structure to {studentName}</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                            ></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {error && <div className="alert alert-danger">{error}</div>}

                                {loading ? (
                                    <div className="text-center">Loading fee structures...</div>
                                ) : feeStructures.length === 0 ? (
                                    <div className="alert alert-info">
                                        No fee structures available. <a href="/fee-structures/new">Create one first</a>.
                                    </div>
                                ) : (
                                    <div className="mb-3">
                                        <label className="form-label">Select Fee Structure *</label>
                                        <select
                                            className="form-select"
                                            value={selectedStructure}
                                            onChange={(e) => setSelectedStructure(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Choose a fee structure --</option>
                                            {feeStructures.map(fs => (
                                                <option key={fs._id} value={fs._id}>
                                                    {fs.class} - {fs.academicYear} (Rs {fs.totalAmount.toLocaleString()})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading || !selectedStructure}
                                >
                                    Assign Fee Structure
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="modal-backdrop fade show"></div>
        </>
    );
}