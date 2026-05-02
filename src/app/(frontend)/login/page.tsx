import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <div className="login-bg">
      <div className="login-atmo" />
      <div className="login-card">
        <div className="login-mark" />
        <div className="login-eye">A reader · for the chronicle of</div>
        <h1 className="login-title">Korêth</h1>
        <div className="login-sub">Sign in to read, write, and amend the book.</div>
        <LoginForm />
        <div className="login-foot">New here? Ask your Chronicler for an account.</div>
      </div>
    </div>
  )
}
