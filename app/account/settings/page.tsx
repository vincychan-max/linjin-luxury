'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSupabase } from '../../components/providers/SupabaseProvider';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { supabase, session } = useSupabase();

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [uploading, setUploading] = useState(false);

  const [address, setAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: 'CA',
    zip: '',
    country: 'United States'
  });

  // ==================== 初始化 ====================
  useEffect(() => {
    if (!session) {
      toast.error('Please sign in to view account settings');
      router.push('/auth/signin');
      return;
    }

    const user = session.user;

    setDisplayName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
    setPhotoURL(getAvatarUrl(user));

    loadUserData(user.id);

    setLoading(false);
  }, [session, router]);

  const getAvatarUrl = (user: any) => {
    if (!user) return '/default-avatar.png';

    if (user.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    if (user.identities?.[0]?.identity_data?.avatar_url) return user.identities[0].identity_data.avatar_url;
    if (user.user_metadata?.picture) return user.user_metadata.picture;

    return '/default-avatar.png';
  };

  const loadUserData = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      if (data.address) setAddress(data.address);
      if (data.displayName) setDisplayName(data.displayName);
      if (data.photoURL) setPhotoURL(data.photoURL);
    }
  };

  // ==================== 上传头像 ====================
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // 更新 Supabase Auth 用户资料
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      // 更新 users 表
      await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          photoURL: publicUrl,
          updated_at: new Date().toISOString()
        });

      setPhotoURL(publicUrl);
      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // ==================== 保存资料 ====================
  const saveProfile = async () => {
    if (!session) return;

    try {
      await supabase.auth.updateUser({
        data: { full_name: displayName }
      });

      await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          displayName,
          address,
          updated_at: new Date().toISOString()
        });

      toast.success('Account settings saved successfully');
    } catch (error) {
      toast.error('Save failed');
    }
  };

  // ==================== 重置密码 ====================
  const changePassword = async () => {
    if (!session?.user?.email) return;

    try {
      await supabase.auth.resetPasswordForEmail(session.user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      toast.error('Failed to send reset email');
    }
  };

  // ==================== 退出登录 ====================
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
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
              <Image 
                src={photoURL} 
                alt="Profile" 
                width={200} 
                height={200} 
                className="rounded-full object-cover shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png';
                }}
              />
            </div>
            <label className="block mt-8 cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="hidden" 
                disabled={uploading}
              />
              <span className="bg-black text-white px-12 py-4 text-xl uppercase tracking-wide hover:opacity-90 transition inline-block">
                {uploading ? 'Uploading...' : 'Upload New Picture'}
              </span>
            </label>
          </div>

          {/* Personal Information */}
          <div className="bg-white p-8 md:p-16 rounded-2xl shadow-lg">
            <h2 className="text-3xl md:text-4xl uppercase tracking-widest mb-12">Personal Information</h2>
            <div className="space-y-8 text-xl md:text-2xl">
              <div>
                <p className="opacity-80 mb-2">Email</p>
                <p className="font-medium">{session?.user?.email}</p>
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
              <input 
                type="text" 
                placeholder="Full Name *" 
                value={address.name} 
                onChange={e => setAddress({...address, name: e.target.value})} 
                className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" 
              />
              <input 
                type="text" 
                placeholder="Street Address *" 
                value={address.street} 
                onChange={e => setAddress({...address, street: e.target.value})} 
                className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" 
              />
              <input 
                type="text" 
                placeholder="City *" 
                value={address.city} 
                onChange={e => setAddress({...address, city: e.target.value})} 
                className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" 
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input 
                  type="text" 
                  placeholder="State" 
                  value={address.state} 
                  onChange={e => setAddress({...address, state: e.target.value})} 
                  className="border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" 
                />
                <input 
                  type="text" 
                  placeholder="ZIP Code *" 
                  value={address.zip} 
                  onChange={e => setAddress({...address, zip: e.target.value})} 
                  className="border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" 
                />
              </div>
              <input 
                type="text" 
                placeholder="Country" 
                value={address.country} 
                disabled 
                className="w-full border-b-2 border-gray-300 py-4 text-black/60" 
              />
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