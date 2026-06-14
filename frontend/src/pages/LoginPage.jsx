import LoginForm from '../components/Auth/LoginForm';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function LoginPage() {
  const { user } = useAuth();

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="login-page" id="login-page">
      <div className="login-bg">
        <div className="login-bg-orb" />
        <div className="login-bg-orb" />
        <div className="login-bg-orb" />
      </div>

      <div className="login-card-wrapper">
        <div className="login-brand">
          <div className="login-brand-icon">⚡</div>
          <h1>HyperDispatch</h1>
          <p>Hyper-Local Delivery Management</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
