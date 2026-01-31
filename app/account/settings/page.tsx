'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getAuth, onAuthStateChanged, updateProfile, sendPasswordResetEmail, signOut } from "firebase/auth";
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  doc, 
  getDoc, 
  setDoc 
} from "firebase/firestore";

export default function AccountSettingsPage() {
  const router = useRouter();
  const auth = getAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [address, setAddress] = useState({
    name: '', street: '', city: '', state: 'CA', zip: '', country: 'USA'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        toast.error('Please sign in to view account settings');
        router.push('/auth/signin');
        return;
      }

      setUser(currentUser);
      setDisplayName(currentUser.displayName || '');
      setPhotoURL(currentUser.photoURL || '');

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.address) setAddress(data.address);
          if (data.displayName) setDisplayName(data.displayName);  // ← 已修复
          if (data.photoURL) setPhotoURL(data.photoURL);
        }
      } catch (error) {
        console.error("Load user data error:", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // 上传头像
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: url });
      await setDoc(doc(db, "users", user.uid), { photoURL: url }, { merge: true });

      setPhotoURL(url);
      toast.success('Profile picture updated');
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  // 保存
  const saveProfile = async () => {
    if (!user) return;

    try {
      await updateProfile(user, { displayName });

      await setDoc(doc(db, "users", user.uid), {
        displayName,
        address,
        email: user.email,
        updated_at: new Date(),
      }, { merge: true });

      toast.success('Account settings saved successfully');
    } catch (error) {
      toast.error('Save failed');
    }
  };

  // 更改密码
  const changePassword = async () => {
    if (!user?.email) return;

    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      toast.error('Failed to send reset email');
    }
  };

  // 注销
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Sign out failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-4xl uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 md:py-24">
      <div className="w-full px-6 md:px-16 lg:px-24">
        <h1 className="text-5xl uppercase tracking-widest text-center mb-16">Account Settings</h1>

        <div className="space-y-24 max-w-4xl mx-auto">
          {/* Profile Picture */}
          <div className="bg-white p-8 md:p-16 rounded-2xl shadow-lg text-center">
            <h2 className="text-3xl md:text-4xl uppercase tracking-widest mb-12">Profile Picture</h2>
            <div className="relative inline-block">
              {photoURL ? (
                <Image 
                  src={photoURL} 
                  alt="Profile" 
                  width={200} 
                  height={200} 
                  className="rounded-full object-cover shadow-lg"
                />
              ) : (
                <div className="w-52 h-52 bg-gray-200 rounded-full flex items-center justify-center text-6xl font-bold text-gray-500">
                  {displayName.charAt(0) || user?.email?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <label className="block mt-8 cursor-pointer">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <span className="bg-black text-white px-12 py-4 text-xl uppercase tracking-wide hover:opacity-90 transition inline-block">
                Upload New Picture
              </span>
            </label>
          </div>

          {/* Personal Information */}
          <div className="bg-white p-8 md:p-16 rounded-2xl shadow-lg">
            <h2 className="text-3xl md:text-4xl uppercase tracking-widest mb-12">Personal Information</h2>
            <div className="space-y-8 text-xl md:text-2xl">
              <div>
                <p className="opacity-80 mb-2">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={displayName} 
                onChange={e => setDisplayName(e.target.value)} 
                className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500"
              />
              <button 
                onClick={changePassword}
                className="bg-gray-200 text-black px-12 py-4 text-xl uppercase tracking-wide hover:opacity-90 transition inline-block mt-8"
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Default Shipping Address */}
          <div className="bg-white p-8 md:p-16 rounded-2xl shadow-lg">
            <h2 className="text-3xl md:text-4xl uppercase tracking-widest mb-12">Default Shipping Address</h2>
            <div className="grid gap-8 text-xl md:text-2xl">
              <input type="text" placeholder="Full Name *" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" />
              <input type="text" placeholder="Street Address *" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" />
              <input type="text" placeholder="City *" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input type="text" placeholder="State" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" />
                <input type="text" placeholder="ZIP Code *" value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} className="border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" />
              </div>
              <input type="text" placeholder="Country" value={address.country} disabled className="w-full border-b-2 border-gray-300 py-4 text-black/60" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            <button 
              onClick={saveProfile}
              className="bg-black text-white px-24 py-6 text-2xl uppercase tracking-wide hover:opacity-90 transition"
            >
              Save Changes
            </button>
            <button 
              onClick={handleSignOut}
              className="bg-gray-200 text-black px-24 py-6 text-2xl uppercase tracking-wide hover:opacity-90 transition"
            >
              Sign Out
            </button>
          </div>

          {/* Back Links */}
          <div className="text-center space-y-8">
            <Link href="/account" className="block text-2xl uppercase tracking-widest hover:opacity-80 transition">
              ← Back to My Account
            </Link>
            <Link href="/" className="block text-xl opacity-80 hover:opacity-100 transition">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}