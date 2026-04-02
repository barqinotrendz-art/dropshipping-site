import React, { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { HiMail, HiCheckCircle } from "react-icons/hi";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";

import { auth } from "../../lib/firebase";
// AppRole type removed because it's not used in this file
import { ensureUserDocument } from "./authHelpers";
import { useAuth } from "../../hooks/useAuth";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
} from "firebase/auth";



const PasswordlessLogin: React.FC = () => {

  const { user } = useAuth();
  // Helper to force reload user context after sign-in
  const forceReload = () => {
    // Reload the page to ensure AuthContext picks up the latest user role
    window.location.reload();
  };


  const [email, setEmail] = useState("");
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false); // Prevent duplicate error messages

  // Clear error when user becomes authenticated
  useEffect(() => {
    if (user) {
      setError(null);
    }
  }, [user]);

  const redirectAfterAuth = () => {
    // Always reload to ensure AuthContext is up to date with Firestore role
    forceReload();
  };

  // Handle email link sign-in on page load
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailForSignIn = window.localStorage.getItem('emailForSignIn');
      
      if (!emailForSignIn) {
        // User opened the link on a different device. Ask for email again.
        emailForSignIn = window.prompt('Please provide your email for confirmation');
      }
      
      if (emailForSignIn) {
        signInWithEmailLink(auth, emailForSignIn, window.location.href)
          .then(async (result) => {
            // Clear the email from storage
            window.localStorage.removeItem('emailForSignIn');
            
            const fallbackName = result.user.displayName || emailForSignIn!.split("@")[0] || "User";
            // ensureUserDocument should always set a role field if missing
            await ensureUserDocument(
              result.user.uid,
              emailForSignIn!,
              fallbackName,
            );
            // userData is not used
            toast.success("Successfully signed in!");
            redirectAfterAuth();
          })
          .catch((error) => {
            console.error('Error signing in with email link:', error);
            
            // Only show specific error messages, avoid generic failures
            if (error?.code === 'auth/invalid-action-code') {
              toast.error("This sign-in link has expired or been used already. Please request a new one.");
            } else if (error?.code === 'auth/invalid-email') {
              toast.error("Invalid email address. Please request a new sign-in link.");
            } else {
              toast.error("Failed to sign in with this link. Please try requesting a new sign-in link.");
            }
            
            window.localStorage.removeItem('emailForSignIn');
            // Don't redirect on email link failures - let user try again
          });
      }
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoadingGoogle(true);
    setIsSigningIn(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const userCredential = await signInWithPopup(auth, provider);

      const email = userCredential.user.email ?? "";
      const fallbackName =
        userCredential.user.displayName ||
        email.split("@")[0] ||
        "User";

      // ensureUserDocument should always set a role field if missing
      await ensureUserDocument(
        userCredential.user.uid,
        email,
        fallbackName,
      );
      // userData is not used
      // Small delay to ensure any error toasts are cleared before success
      setTimeout(() => {
        toast.success("Welcome to our store!");
        redirectAfterAuth();
      }, 100);
      
    } catch (err) {
      // Only show errors if we're still in the signing in state (not cancelled)
      if (isSigningIn) {
        console.error('Google sign-in error:', err);
        
        if (err instanceof Error && "code" in err) {
          const firebaseError = err as { code: string; message: string };

          switch (firebaseError.code) {
            case "auth/popup-closed-by-user":
            case "auth/cancelled-popup-request":
              // User cancelled - don't show error, just reset loading state
              break;
            case "auth/popup-blocked":
              setError("Popup blocked. Please allow popups for this site and try again.");
              break;
            case "auth/account-exists-with-different-credential":
              setError("An account already exists with this email. Please try signing in a different way.");
              break;
            case "auth/operation-not-allowed":
              setError("Google sign-in is not enabled. Please contact support.");
              break;
            default:
              // Only show error for actual failures, not user cancellations
              if (!firebaseError.code.includes('popup') && !firebaseError.code.includes('cancelled')) {
                setError("Failed to sign in with Google. Please try again.");
              }
          }
        } else {
          setError("Failed to sign in with Google. Please try again.");
        }
      }
    } finally {
      setIsLoadingGoogle(false);
      // Reset signing in state after a short delay
      setTimeout(() => setIsSigningIn(false), 200);
    }
  };

  const handleEmailLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setIsLoadingEmail(true);

    try {
      console.log('Attempting to send email link to:', email);
      console.log('Current origin:', window.location.origin);
      
      const actionCodeSettings = {
        url: window.location.origin + '/auth',
        handleCodeInApp: true,
      };

      console.log('Action code settings:', actionCodeSettings);

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      console.log('Email link sent successfully');
      
      // Save the email locally so we don't need to ask again
      window.localStorage.setItem('emailForSignIn', email);
      
      toast.success("Sign-in link sent! Check your email.");
      setEmailSent(true);
      setEmail("");
    } catch (err) {
      console.error('Email link error details:', err);
      
      if (err instanceof Error && "code" in err) {
        const firebaseError = err as { code: string; message: string };
        
        console.error('Firebase error code:', firebaseError.code);
        console.error('Firebase error message:', firebaseError.message);

        switch (firebaseError.code) {
          case "auth/invalid-email":
            setError("Please enter a valid email address.");
            break;
          case "auth/too-many-requests":
            setError("Too many requests. Please wait a moment and try again.");
            break;
          case "auth/operation-not-allowed":
            setError("Email link sign-in is not enabled. Please contact support or use Google sign-in instead.");
            break;
          case "auth/invalid-continue-uri":
            setError("Configuration error. Please contact support or use Google sign-in instead.");
            break;
          case "auth/unauthorized-continue-uri":
            setError("Domain not authorized. Please contact support or use Google sign-in instead.");
            break;
          default:
            setError(`Failed to send sign-in link: ${firebaseError.message || 'Unknown error'}. Please try Google sign-in instead.`);
        }
      } else {
        setError("Failed to send sign-in link. Please try Google sign-in instead.");
      }
    } finally {
      setIsLoadingEmail(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div style={{ maxWidth: 480 }} className="animate-fadeIn w-full">
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mb-6 shadow-lg">
                <HiCheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">Check Your Email</h1>
              <p className="text-slate-600 text-lg mb-8">
                We've sent a secure sign-in link to your email address. Click the link to access your account instantly.
              </p>
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl text-left mb-6">
                <p className="text-sm text-blue-700">
                  <strong>🔒 Security Notice:</strong> The link will expire in 1 hour for your protection. 
                  If you don't see the email, check your spam folder.
                </p>
              </div>
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Try Another Method
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div style={{ maxWidth: 480 }} className="animate-fadeIn w-full">
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-10">
           
            <h1 className="text-4xl font-bold text-gray-700 mb-3">Welcome Back</h1>
            <p className="text-slate-600 text-lg">Sign in to your account securely</p>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 text-rose-700 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-rose-500 rounded-full flex-shrink-0"></div>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

        {/* Google Sign In - Primary Method */}
        <div className="mb-8">
          <Button
            onClick={handleGoogleSignIn}
            loading={isLoadingGoogle}
            disabled={isLoadingEmail}
            variant="outline"
            size="lg"
            icon={<FcGoogle className="w-6 h-6" />}
            className=" flex-row w-full  hover:shadow-xl hover:scale-[1.02] transition-all duration-300  border-2  hover:border-black"
          >
            <span className="font-semibold text-slate-700">Continue with Google</span>
          </Button>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-white/90 text-slate-500 font-medium">Or continue with email</span>
          </div>
        </div>

        {/* Email Link Sign In */}
        <form onSubmit={handleEmailLinkSignIn} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={isLoadingEmail || isLoadingGoogle}
              className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-300 bg-white/90 backdrop-blur hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-400"
            />
          </div>

          <Button
            type="submit"
            loading={isLoadingEmail}
            disabled={isLoadingGoogle}
            variant="primary"
            size="lg"
            className="w-full"
            icon={<HiMail className="w-5 h-5" />}
          >
            {isLoadingEmail ? "Sending secure link..." : "Send Sign-in Link"}
          </Button>
        </form>

      
      </div>
    </div>
  </div>
);
};

export default PasswordlessLogin;