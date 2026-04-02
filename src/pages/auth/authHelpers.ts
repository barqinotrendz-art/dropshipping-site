import type { NavigateFunction } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { AppRole } from "../../contexts/AuthContext";
import { ADMIN_BASE_PATH } from "../../constants/routes";

/**
 * Ensures a user document exists in Firestore.
 * Creates the document if it doesn't exist, or returns existing document.
 */
export async function ensureUserDocument(
  uid: string,
  email: string,
  displayName: string
) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData = {
      uid,
      email,
      displayName,
      role: "customer" as AppRole,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, userData);
    const newSnap = await getDoc(userRef);
    return { userSnap: newSnap, isNew: true };
  }

  return { userSnap, isNew: false };
}

/**
 * Redirects user after authentication based on their role.
 */
export function redirectAfterAuth(navigate: NavigateFunction, role: AppRole, from?: string) {
  if (from && from !== "/" && from !== "/login" && from !== "/auth") {
    navigate(from, { replace: true });
  } else if (role === "admin") {
    navigate(ADMIN_BASE_PATH, { replace: true });
  } else {
    navigate("/", { replace: true });
  }
}
