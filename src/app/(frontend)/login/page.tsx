import { LoginForm } from './LoginForm'
import { getServerLocale } from '@/i18n/getServerLocale'
import { translate } from '@/i18n'

export default async function LoginPage() {
  const locale = await getServerLocale()
  const t = (k: Parameters<typeof translate>[1]) => translate(locale, k)
  return (
    <div className="login-bg">
      <div className="login-atmo" />
      <div className="login-card">
        <div className="login-mark" />
        <div className="login-eye">{t('login.eyebrow')}</div>
        <h1 className="login-title">Korêth</h1>
        <div className="login-sub">{t('login.sub')}</div>
        <LoginForm />
        <div className="login-foot">{t('login.foot')}</div>
      </div>
    </div>
  )
}
