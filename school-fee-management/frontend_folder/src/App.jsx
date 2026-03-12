// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import PublicLayout from './components/PublicLayout';
import PrivateLayout from './components/PrivateLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import MyPayments from './pages/MyPayments';
import AddStudentWithParent from './pages/AddStudentWithParent';
import FeeCategoriesList from './pages/FeeCategoriesList';
import CreateFeeStructure from './pages/CreateFeeStructure';
import FeeStructuresList from './pages/FeeStructuresList';
import PaymentForm from './pages/PaymentForm';
import PaymentHistory from './pages/PaymentHistory';
import StudentsWithFees from './pages/StudentsWithFees';
import PendingFees from './pages/PendingFees';
import ParentList from './pages/ParentList';
import Support from './pages/Support';
import Profile from './pages/Profile';

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <PublicLayout>
                                <Login />
                            </PublicLayout>
                        </PublicRoute>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <PrivateLayout>
                                <Dashboard />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/students"
                    element={
                        <ProtectedRoute roles={['admin', 'accountant']}>
                            <PrivateLayout>
                                <StudentList />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/payments/new"
                    element={
                        <ProtectedRoute roles={['admin', 'accountant']}>
                            <PrivateLayout>
                                <PaymentForm />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/payments/new/:studentId"
                    element={
                        <ProtectedRoute roles={['admin', 'accountant']}>
                            <PrivateLayout>
                                <PaymentForm />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/payments"
                    element={
                        <ProtectedRoute roles={['admin', 'accountant']}>
                            <PrivateLayout>
                                <PaymentHistory />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/payments/student/:studentId"
                    element={
                        <ProtectedRoute roles={['admin', 'accountant', 'parent']}>
                            <PrivateLayout>
                                <PaymentHistory />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-payments"
                    element={
                        <ProtectedRoute roles={['parent', 'student']}>
                            <PrivateLayout>
                                <MyPayments />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/add-student-parent"
                    element={
                        <ProtectedRoute roles={['admin']}>
                            <PrivateLayout>
                                <AddStudentWithParent />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/fee-categories"
                    element={
                        <ProtectedRoute roles={['admin']}>
                            <PrivateLayout>
                                <FeeCategoriesList />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/parents"
                    element={
                        <ProtectedRoute roles={['admin', 'accountant']}>
                            <PrivateLayout>
                                <ParentList />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/fee-structures"
                    element={
                        <ProtectedRoute roles={['admin']}>
                            <PrivateLayout>
                                <FeeStructuresList />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/fee-structures/new"
                    element={
                        <ProtectedRoute roles={['admin']}>
                            <PrivateLayout>
                                <CreateFeeStructure />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/fee-structures/edit/:id"
                    element={
                        <ProtectedRoute roles={['admin']}>
                            <PrivateLayout>
                                <CreateFeeStructure />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/students/with-fees"
                    element={
                        <ProtectedRoute roles={['admin', 'accountant']}>
                            <PrivateLayout>
                                <StudentsWithFees />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/students/pending-fees"
                    element={
                        <ProtectedRoute roles={['admin', 'accountant']}>
                            <PrivateLayout>
                                <PendingFees />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/support"
                    element={
                        <ProtectedRoute>
                            <PrivateLayout>
                                <Support />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <PrivateLayout>
                                <Profile />
                            </PrivateLayout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AuthProvider>
    );
}

export default App;