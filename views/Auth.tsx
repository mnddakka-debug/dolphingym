import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Mail, Lock, ArrowRight, ShieldCheck, Loader2, ShieldAlert, CheckCircle2, Shield } from 'lucide-react';
import Logo from '../components/Logo';
import DarkVeil from '../components/DarkVeil';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';

const Auth: React.FC = () => {
  const { language, login } = useApp();
  const t = TRANSLATIONS[language];
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setError(language === 'en' ? 'Enter your email first' : 'أدخل إيميلك أولاً');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError(null);
    } catch (err: any) {
      setError(language === 'en' ? 'Could not send reset email: ' + err.message : 'لم يتمكن من إرسال رابط الإعادة: ' + err.message);
    }
  };

  // Handle redirect result for PWA / Mobile Google Sign In
  React.useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        setIsVerifying(true);
        setSuccess(true);
        const role = result.user.email === 'admin@dolphingym.com' ? 'admin' : 'member';
        setTimeout(async () => {
          await login(result.user.email || 'user@example.com', role);
        }, 1000);
      }
    }).catch((err) => {
      // Only show error if it's a real failure, not just "no redirect pending"
      if (err.code && err.code !== 'auth/no-current-user') {
        console.error("Redirect Auth Error:", err);
        setError(language === 'en' ? 'Google Sign-In failed: ' + err.message : 'فشل تسجيل الدخول عبر جوجل: ' + err.message);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsVerifying(true);
    const provider = new GoogleAuthProvider();
    try {
      // Use popup for all devices — more reliable than redirect on mobile browsers
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const role = user.email === 'admin@dolphingym.com' ? 'admin' : 'member';
      await login(user.email || 'user@example.com', role);
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      // Suppress popup closure errors (user cancelled)
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        if (err.code === 'auth/popup-blocked') {
          // Popup was blocked by the browser — fallback to redirect
          try {
            await signInWithRedirect(auth, provider);
            return; // Page will redirect, don't reset isVerifying
          } catch (redirectErr: any) {
            setError(language === 'en' ? 'Sign-In failed. Please allow popups.' : 'فشل تسجيل الدخول. يرجى السماح بالنوافذ المنبثقة.');
          }
        } else {
          setError(language === 'en' ? 'Google Sign-In failed: ' + err.message : 'فشل تسجيل الدخول عبر جوجل: ' + err.message);
        }
      }
      setIsVerifying(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic required field check
    if (!email || !password) {
      setError(language === 'en' ? 'Email and Password are required' : 'البريد الإلكتروني وكلمة المرور مطلوبة');
      return;
    }

    if (!isLogin) {
      // Sign up mode: check confirm password
      if (password !== confirmPassword) {
        setError(language === 'en' ? 'Passwords do not match' : 'كلمتا المرور غير متطابقتين');
        return;
      }
      setIsVerifying(true);
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccess(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const role = email === 'admin@dolphingym.com' ? 'admin' : 'member';
        await login(email, role, referralCode);
      } catch (err: any) {
        setError(err.message || 'Sign up failed');
      }
      setIsVerifying(false);
      return;
    }

    setIsVerifying(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const role = email === 'admin@dolphingym.com' ? 'admin' : 'member';
      await login(email, role);
    } catch (err: any) {
      const code = err.code || '';
      let msg = err.message || 'Unknown error';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') msg = language === 'en' ? 'Wrong password' : 'كلمة المرور خاطئة';
      else if (code === 'auth/user-not-found') msg = language === 'en' ? 'No account with this email' : 'لا يوجد حساب بهذا الإيميل';
      else if (code === 'auth/network-request-failed') msg = language === 'en' ? 'Network error — check connection' : 'خطأ في الشبكة';
      else if (code === 'auth/too-many-requests') msg = language === 'en' ? 'Too many attempts. Try later.' : 'محاولات كثيرة. حاول لاحقاً.';
      setError(msg + (code ? ` [${code}]` : ''));
      console.warn(`[AUTH ERROR] ${code}:`, err.message);
    }
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen flex flex-col p-8 animate-in fade-in duration-1000 relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at 20% 50%, #0a1628 0%, #000510 40%, #010a1a 100%)' }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Animated CSS background — works on ALL devices, no WebGL required */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-10 animate-pulse" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', top: '-10%', left: '-10%', animationDuration: '4s' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-10 animate-pulse" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', bottom: '-5%', right: '-5%', animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-5 animate-pulse" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', top: '40%', right: '20%', animationDuration: '5s', animationDelay: '1s' }} />
      </div>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none z-[1]" />
      {/* Security Status Header */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-center pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full backdrop-blur-md">
          <Shield size={10} className="text-blue-400 animate-pulse" />
          <span className="text-[8px] font-black text-blue-400/80 uppercase tracking-[0.4em]">Secure Environment • AES-256 Enabled</span>
        </div>
      </div>

      {/* All auth content above background */}
      <div className="relative z-[2] flex flex-col flex-1">

        {/* Header / Branding */}
        <div className="mt-16 mb-10 flex flex-col items-center text-center">
          <Logo size={120} className="mb-8 transform hover:scale-105 transition-all duration-700 ease-out drop-shadow-[0_0_30px_rgba(59,130,246,0.2)]" />
          <h1 className="text-4xl font-black blue-gradient tracking-[0.25em] mb-2 uppercase drop-shadow-lg">{t.appName}</h1>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-1 rounded-full border border-white/10 mt-2">
            <ShieldCheck size={14} className="text-blue-400" />
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Authorized Personnel Only</span>
          </div>
        </div>

        <div className="max-w-sm mx-auto w-full space-y-8 relative">

          {/* Verification Overlay */}
          {isVerifying && (
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center rounded-[3rem] border border-white/10 animate-in fade-in zoom-in duration-500 shadow-2xl">
              {!success ? (
                <>
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                    <Loader2 size={64} className="text-blue-500 animate-spin" strokeWidth={1} />
                    <ShieldCheck size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white shadow-xl" />
                  </div>
                  <p className="text-sm font-black text-white uppercase tracking-[0.4em] animate-pulse">
                    {language === 'en' ? 'Verifying Identity' : 'جاري التحقق'}
                  </p>
                  <div className="mt-8 flex gap-1">
                    {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30 mb-6">
                    <CheckCircle2 size={48} className="text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                  </div>
                  <p className="text-lg font-black text-white uppercase tracking-[0.2em]">
                    {language === 'en' ? 'Access Granted' : 'تم السماح بالدخول'}
                  </p>
                  <p className="mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Redirecting to Dashboard...</p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleManualLogin} className="flex flex-col gap-6">
            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-2 bg-white text-black font-bold py-2 px-4 rounded-full shadow hover:bg-gray-100 transition mb-2 border border-gray-200"
              style={{ direction: 'ltr' }}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Sign in with Google' : 'تسجيل الدخول عبر جوجل'}
            </button>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4 shadow-lg">
                <ShieldAlert size={24} className="text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Security Alert</p>
                  <p className="text-xs text-red-200/80 font-bold leading-tight">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-2">{t.email}</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="text-gray-600 group-focus-within:text-blue-400 transition-colors" size={20} />
                </div>
                <input
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-[2rem] py-5 pl-14 pr-7 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all text-sm font-medium tracking-wide placeholder:text-gray-700"
                  placeholder="dolphingym@gmail.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{t.password}</label>
                {isLogin && <button type="button" onClick={handleForgotPassword} className="text-[10px] text-gray-600 font-black hover:text-blue-400 transition-colors uppercase tracking-widest">{t.forgotPassword}</button>}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="text-gray-600 group-focus-within:text-blue-400 transition-colors" size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-[2rem] py-5 pl-14 pr-7 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all text-sm font-medium placeholder:text-gray-700"
                  placeholder="••••••••••••"
                />
              </div>
            </div>
            {/* Confirm Password for Sign Up */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-2">
                  {language === 'en' ? 'Confirm Password' : 'تأكيد كلمة المرور'}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="text-gray-600 group-focus-within:text-blue-400 transition-colors" size={20} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(null); }}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-[2rem] py-5 pl-14 pr-7 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all text-sm font-medium placeholder:text-gray-700"
                    placeholder={language === 'en' ? 'Confirm your password' : 'أعد إدخال كلمة المرور'}
                  />
                </div>
              </div>
            )}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-2">
                  {language === 'en' ? 'Referral Code (Optional)' : 'رمز الإحالة (اختياري)'}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Shield className="text-gray-600 group-focus-within:text-blue-400 transition-colors" size={20} />
                  </div>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={e => { setReferralCode(e.target.value); }}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-[2rem] py-5 pl-14 pr-7 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all text-sm font-medium uppercase placeholder:text-gray-700"
                    placeholder="e.g. A1B2C3"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="mt-6 py-5 blue-bg rounded-[2rem] text-white font-black text-xl shadow-2xl shadow-blue-500/30 hover:scale-[1.02] hover:blue-glow active:scale-95 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              <span className="uppercase tracking-[0.2em]">{isLogin ? t.login : (language === 'en' ? 'Sign Up' : 'إنشاء حساب')}</span>
              <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
            </button>
            {/* Toggle Login/Sign Up */}
            <div className="pt-4 text-center">
              <button
                type="button"
                className="text-[11px] text-blue-400 font-bold underline underline-offset-4 hover:text-blue-300 transition-colors"
                onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(false); }}
              >
                {isLogin
                  ? (language === 'en' ? "Don't have an account? Create one" : 'ليس لديك حساب؟ أنشئ حسابًا')
                  : (language === 'en' ? 'Already have an account? Log in' : 'لديك حساب بالفعل؟ سجل الدخول')}
              </button>
            </div>

            <div className="pt-8 text-center">
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
                By attempting to access this system, you acknowledge that all activity is monitored and recorded.
              </p>
            </div>
          </form>
        </div>

        <div className="mt-auto py-10 flex flex-col items-center gap-4">
          <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-blue-500/40 animate-[loading_3s_infinite_linear]" />
          </div>
          <p className="text-[9px] font-black uppercase text-gray-600 tracking-[0.5em] opacity-40">
            Secure Core Jordan Data Center
          </p>
        </div>

        <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
      </div>{/* end z-[2] content wrapper */}
    </div>
  );
};

export default Auth;
