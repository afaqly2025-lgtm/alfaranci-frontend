import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

const INACTIVITY_LIMIT_MS = 2 * 60 * 1000;
const LAST_ACTIVITY_KEY = 'adminLastActivityAt';

export const AdminInactivityGuard = () => {
  const { user, lockSession } = useAuth();
  const timerRef = useRef(null);
  const lockingRef = useRef(false);

  useEffect(() => {
    if (user?.role !== 'Admin') return undefined;

    const lock = async () => {
      if (lockingRef.current) return;
      lockingRef.current = true;
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      await lockSession();
    };

    const scheduleLock = (lastActivity) => {
      window.clearTimeout(timerRef.current);
      const remaining = INACTIVITY_LIMIT_MS - (Date.now() - lastActivity);
      if (remaining <= 0) {
        void lock();
        return;
      }
      timerRef.current = window.setTimeout(lock, remaining);
    };

    const registerActivity = () => {
      if (lockingRef.current) return;
      const now = Date.now();
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      scheduleLock(now);
    };

    const checkInactivity = () => {
      const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || Date.now();
      if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(lastActivity));
      }
      scheduleLock(lastActivity);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkInactivity();
    };

    const handleStorage = (event) => {
      if (event.key !== LAST_ACTIVITY_KEY || !event.newValue) return;
      scheduleLock(Number(event.newValue));
    };

    const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, registerActivity, { passive: true });
    });
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', checkInactivity);
    window.addEventListener('storage', handleStorage);
    checkInactivity();

    return () => {
      window.clearTimeout(timerRef.current);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, registerActivity));
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', checkInactivity);
      window.removeEventListener('storage', handleStorage);
    };
  }, [lockSession, user]);

  return null;
};
