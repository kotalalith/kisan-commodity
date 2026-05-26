import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // 1. If we have a local mock session, ignore the null state from Firebase Auth
      const mockSession = localStorage.getItem("agrobridge_mock_session");
      if (mockSession) {
        const parsedUser = JSON.parse(mockSession);
        setCurrentUser(parsedUser);
        
        // Load custom profile fallback from localStorage
        const localData = localStorage.getItem("agrobridge_fallback_profile_" + parsedUser.uid);
        if (localData) {
          setUserData(JSON.parse(localData));
        } else {
          setUserData(null);
        }
        setLoading(false);
        return;
      }

      // 2. Normal Firebase authentication flow
      setCurrentUser(user);
      if (user) {
        // Fetch custom user data from Firestore in the background
        const fetchPromise = getDoc(doc(db, "users", user.uid))
          .then((userDoc) => {
            if (userDoc.exists()) {
              setUserData({ id: userDoc.id, ...userDoc.data() });
            } else {
              // Try local storage fallback
              const localData = localStorage.getItem("agrobridge_fallback_profile_" + user.uid);
              if (localData) {
                setUserData(JSON.parse(localData));
              } else {
                setUserData(null); // Needs signup
              }
            }
          })
          .catch((error) => {
            console.error("Error fetching user data from Firestore:", error);
            const localData = localStorage.getItem("agrobridge_fallback_profile_" + user.uid);
            if (localData) {
              setUserData(JSON.parse(localData));
            } else {
              setUserData(null);
            }
          });

        // Race the Firestore query against a 3-second timeout to prevent app from hanging
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            // If Firestore times out, see if we can resolve using local storage immediately
            const localData = localStorage.getItem("agrobridge_fallback_profile_" + user.uid);
            if (localData) {
              setUserData(JSON.parse(localData));
            }
            resolve();
          }, 3000);
        });
        await Promise.race([fetchPromise, timeoutPromise]);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = () => {
    localStorage.removeItem("agrobridge_mock_session");
    return signOut(auth);
  };

  const localLogin = (mockUser) => {
    localStorage.setItem("agrobridge_mock_session", JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    
    // Check for cached profile
    const localData = localStorage.getItem("agrobridge_fallback_profile_" + mockUser.uid);
    if (localData) {
      setUserData(JSON.parse(localData));
    } else {
      setUserData(null);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, userData, setUserData, loading, logout, localLogin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
