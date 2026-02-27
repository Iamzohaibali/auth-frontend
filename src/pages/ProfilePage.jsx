import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Camera, User, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { profileAPI } from '../api/index.js';
import { Input, Button } from '../components/ui/FormElements.jsx';
import useAuthStore from '../store/authStore.js';
import EmailVerificationBanner from '../components/ui/EmailVerificationBanner.jsx';

export default function ProfilePage() {
  const user       = useAuthStore((s) => s.user);
  const logout     = useAuthStore((s) => s.logout);
  const updateUser = useAuthStore((s) => s.updateUser);
  const navigate   = useNavigate();

  const [uploading,  setUploading]  = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const fileRef = useRef(null);

  const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName:  user?.lastName  ?? '',
      bio:       user?.bio       ?? '',
      phone:     user?.phone     ?? '',
      location:  user?.location  ?? '',
      website:   user?.website   ?? '',
    },
  });

  const { register: rDel, handleSubmit: hDel, formState: { isSubmitting: deleting } } = useForm();

  const onSave = async (data) => {
    try {
      const res = await profileAPI.updateProfile(data);
      updateUser(res.data.user);
      reset({
        firstName: res.data.user.firstName ?? '',
        lastName:  res.data.user.lastName  ?? '',
        bio:       res.data.user.bio       ?? '',
        phone:     res.data.user.phone     ?? '',
        location:  res.data.user.location  ?? '',
        website:   res.data.user.website   ?? '',
      });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Update failed');
    }
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    setUploading(true);
    try {
      const res = await profileAPI.uploadAvatar(fd);
      updateUser({ avatar: res.data.avatar });
      toast.success('Avatar updated!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeAvatar = async () => {
    try {
      await profileAPI.deleteAvatar();
      updateUser({ avatar: { url: '', publicId: '' } });
      toast.success('Avatar removed');
    } catch {
      toast.error('Failed to remove avatar');
    }
  };

  const onDelete = async ({ password }) => {
    try {
      await profileAPI.deleteAccount(password);
      await logout();
      toast.success('Account deleted');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to delete account');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>

      {/* Email verification banner — compact, only shows if not verified */}
      <EmailVerificationBanner compact />

      {/* Avatar */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Profile Picture</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative shrink-0">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Camera className="w-4 h-4" /> Upload Photo
            </Button>
            {user?.avatar?.url && (
              <Button variant="ghost" size="sm" onClick={removeAvatar}>
                <Trash2 className="w-4 h-4 text-red-500" /> Remove
              </Button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
        </div>
      </section>

      {/* Personal Information */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" /> Personal Information
        </h2>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="First Name" placeholder="John" {...register('firstName', { required: 'Required' })} />
            <Input label="Last Name"  placeholder="Doe"  {...register('lastName',  { required: 'Required' })} />
          </div>
          <Input label="Bio" placeholder="Tell us about yourself…" {...register('bio')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Phone"    type="tel" placeholder="+92 300 1234567" {...register('phone')} />
            <Input label="Location" placeholder="Lahore, Pakistan"           {...register('location')} />
          </div>
          <Input label="Website" type="url" placeholder="https://myportfolio.com" {...register('website')} />

          <div className="flex items-center gap-3 flex-wrap pt-1">
            <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>Save Changes</Button>
            {isDirty && (
              <button type="button" onClick={() => reset()} className="text-sm text-gray-500 hover:text-gray-700">
                Discard
              </button>
            )}
            {!isDirty && !isSubmitting && (
              <p className="text-xs text-gray-400">No unsaved changes</p>
            )}
          </div>
        </form>
      </section>

      {/* Danger Zone */}
      <section className="bg-white rounded-xl border border-red-200 p-5 sm:p-6">
        <h2 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h2>
        <p className="text-sm text-gray-600 mb-4">Deleting your account is permanent and cannot be undone.</p>
        {!showDelete ? (
          <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>Delete Account</Button>
        ) : (
          <form onSubmit={hDel(onDelete)} className="space-y-3">
            <Input label="Enter your password to confirm" type="password"
              {...rDel('password', { required: 'Password required' })} />
            <div className="flex gap-2 flex-wrap">
              <Button type="submit" variant="danger" size="sm" isLoading={deleting}>Confirm Delete</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowDelete(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}