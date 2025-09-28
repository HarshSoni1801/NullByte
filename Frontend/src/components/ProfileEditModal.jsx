import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosClient from '../axiosClient';
import AvatarSelectionModal from './AvatarSelectionModal';
import { X, Loader } from 'lucide-react';

const ProfileEditModal = ({ initialData, onClose, onUpdateSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch,
  } = useForm({
    defaultValues: initialData,
  });

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const avatarUrl = watch('avatarUrl');

  const onSubmit = async (data) => {
    setSubmitError(null);
    clearErrors();

    try {
      await axiosClient.put('/user/updateProfile', data);
      onUpdateSuccess();
      onClose();
      reset(data);
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to update profile. Please try again.';
      setSubmitError(message);
    }
  };

  const handleAvatarSelect = (selectedAvatar) => {
    reset({ ...watch(), avatarUrl: selectedAvatar });
    setShowAvatarModal(false);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40 transition-opacity" />

      {/* Modal container - Increased width */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-800 rounded-xl shadow-2xl p-6 relative text-zinc-300"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              reset(initialData);
              setSubmitError(null);
              clearErrors();
              onClose();
            }}
            className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors z-10"
            aria-label="Close edit profile modal"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold mb-6 text-zinc-100">Edit Profile</h2>

          {/* Avatar section at top */}
          <div className="flex items-center justify-center mb-6">
            <div className="text-center">
              <img
                src={avatarUrl || '/Avatars/default.jpg'}
                alt="Current Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-zinc-600 mx-auto mb-3"
              />
              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors"
              >
                Change Avatar
              </button>
            </div>
          </div>

          {/* Form fields in grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* First Name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-zinc-300" htmlFor="firstName">
                First Name *
              </label>
              <input
                id="firstName"
                {...register('firstName', { required: 'First name is required' })}
                className={`w-full px-3 py-2 bg-zinc-700 border rounded-lg text-white text-sm ${
                  errors.firstName ? 'border-red-500' : 'border-zinc-600'
                }`}
                disabled={isSubmitting}
              />
              {errors.firstName && (
                <p className="text-red-500 mt-1 text-xs">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-zinc-300" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                {...register('lastName')}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm"
                disabled={isSubmitting}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-medium text-zinc-300" htmlFor="emailId">
                Email *
              </label>
              <input
                id="emailId"
                type="email"
                {...register('emailId', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`w-full px-3 py-2 bg-zinc-700 border rounded-lg text-white text-sm ${
                  errors.emailId ? 'border-red-500' : 'border-zinc-600'
                }`}
                disabled={isSubmitting}
              />
              {errors.emailId && (
                <p className="text-red-500 mt-1 text-xs">{errors.emailId.message}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block mb-2 text-sm font-medium text-zinc-300" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                {...register('gender')}
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm"
              >
                <option value="None">None</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Language Preference */}
            <div>
              <label className="block mb-2 text-sm font-medium text-zinc-300" htmlFor="languagePreference">
                Preferred Language
              </label>
              <select
                id="languagePreference"
                {...register('languagePreference')}
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm"
              >
                <option value="None">None</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c++">C++</option>
                <option value="c">C</option>
                <option value="c#">C#</option>
              </select>
            </div>

            {/* Empty spacer to maintain grid alignment */}
            <div></div>
          </div>

          {/* Social Links in 2-column grid */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-zinc-300">Social Links</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  type="url"
                  placeholder="GitHub URL"
                  {...register('socialLinks.github')}
                  className={`w-full px-3 py-2 bg-zinc-700 border rounded-lg text-white text-sm ${
                    errors.socialLinks?.github ? 'border-red-500' : 'border-zinc-600'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.socialLinks?.github && (
                  <p className="text-red-500 mt-1 text-xs">{errors.socialLinks.github.message}</p>
                )}
              </div>
              <div>
                <input
                  type="url"
                  placeholder="LinkedIn URL"
                  {...register('socialLinks.linkedin')}
                  className={`w-full px-3 py-2 bg-zinc-700 border rounded-lg text-white text-sm ${
                    errors.socialLinks?.linkedin ? 'border-red-500' : 'border-zinc-600'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.socialLinks?.linkedin && (
                  <p className="text-red-500 mt-1 text-xs">{errors.socialLinks.linkedin.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* About Me - Full width but compact */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-zinc-300" htmlFor="about">
              About Me
            </label>
            <textarea
              id="about"
              {...register('about', { maxLength: 500 })}
              rows={3}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm resize-none"
              placeholder="Tell us a bit about yourself (max 500 characters)"
              disabled={isSubmitting}
            />
            {errors.about && (
              <p className="text-red-500 mt-1 text-xs">
                About section can be maximum 500 characters.
              </p>
            )}
          </div>

          {/* Submit error message */}
          {submitError && (
            <p className="mb-4 text-center text-red-500 text-sm font-medium">{submitError}</p>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-700">
            <button
              type="button"
              onClick={() => {
                reset(initialData);
                setSubmitError(null);
                onClose();
              }}
              disabled={isSubmitting}
              className="px-4 py-2 text-zinc-300 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-2"
            >
              {isSubmitting && <Loader className="animate-spin h-4 w-4" />}
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <AvatarSelectionModal
          currentAvatar={avatarUrl}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarModal(false)}
        />
      )}
    </>
  );
};

export default ProfileEditModal;