import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'

function Profile() {
    const { username } = useParams()
    const { user: loggedInUser, setUser } = useAuth()
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isFollowing, setIsFollowing] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editForm, setEditForm] = useState({ name: '', username: '', email: '', bio: '' })
    const [selectedImage, setSelectedImage] = useState(null)
    const [previewImage, setPreviewImage] = useState('')
    const [error, setError] = useState('')
    const [saveLoading, setSaveLoading] = useState(false)

    const isOwnProfile = loggedInUser?.username === username

    const fetchProfile = async () => {
        const response = await axiosInstance.get(`/users/profile/${username}`)
        return response.data.userData
    }

    useEffect(() => {
        let mounted = true

        const loadProfile = async () => {
            try {
                setLoading(true)
                setError('')

                const profile = await fetchProfile()
                if (!mounted) return

                setUserData(profile)

                if (isOwnProfile) {
                    setIsFollowing(false)
                    return
                }

                const meResponse = await axiosInstance.get('/users/me')
                const myFollowingList = meResponse.data.followings || []
                const followingIds = myFollowingList.map((item) =>
                    typeof item === 'object' ? item._id : item
                )

                setIsFollowing(
                    followingIds.some((id) => id?.toString() === profile._id?.toString())
                )
            } catch (requestError) {
                console.error('Failed to fetch profile data:', requestError)
                if (mounted) {
                    setUserData(null)
                    setError(requestError.response?.data?.message || 'Failed to load profile.')
                }
            } finally {
                if (mounted) setLoading(false)
            }
        }

        if (username) {
            loadProfile()
        }

        return () => {
            mounted = false
        }
    }, [username, isOwnProfile])

    const handleFollowToggle = async () => {
        if (!userData?._id || actionLoading) return

        try {
            setActionLoading(true)

            if (isFollowing) {
                await axiosInstance.delete(`/users/${userData._id}/unfollow`)
            } else {
                await axiosInstance.post(`/users/${userData._id}/follow`)
            }

            const profile = await fetchProfile()
            setUserData(profile)
            setIsFollowing((prev) => !prev)
        } catch (requestError) {
            console.error('Follow action failed:', requestError)
            alert(requestError.response?.data?.message || 'Something went wrong')
        } finally {
            setActionLoading(false)
        }
    }

    const openEditProfile = () => {
        setEditForm({
            name: userData?.name || '',
            username: userData?.username || '',
            email: userData?.email || '',
            bio: userData?.bio || ''
        })
        setSelectedImage(null)
        setPreviewImage('')
        setIsEditOpen(true)
    }

    const handleEditChange = (event) => {
        const { name, value } = event.target
        setEditForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleImageChange = (event) => {
        const file = event.target.files[0]

        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB.')
            return
        }

        setSelectedImage(file)

        if (previewImage) {
            URL.revokeObjectURL(previewImage)
        }

        // UPDATED: Local object URL is only a preview. Persistence happens on Save Changes.
        setPreviewImage(URL.createObjectURL(file))
    }

    const handleEditSubmit = async (event) => {
        event.preventDefault()

        if (saveLoading) return

        try {
            setSaveLoading(true)
            setError('')

            // UPDATED: FormData sends profile fields and the binary image in one multipart request.
            const formData = new FormData()
            formData.append('name', editForm.name)
            formData.append('username', editForm.username)
            formData.append('email', editForm.email)
            formData.append('bio', editForm.bio)

            if (selectedImage) {
                formData.append('profileImage', selectedImage)
            }

            await axiosInstance.put('/users/profile', formData)

            // UPDATED: Refetch so the Cloudinary URL returned by the server becomes the UI source of truth.
            const updatedProfile = await fetchProfile()
            setUserData(updatedProfile)

            if (isOwnProfile) {
                // UPDATED: Keep AuthContext in sync with the persisted profile.
                setUser(updatedProfile)
            }

            setIsEditOpen(false)
            setSelectedImage(null)

            if (previewImage) {
                URL.revokeObjectURL(previewImage)
                setPreviewImage('')
            }
        } catch (requestError) {
            console.error('Profile update failed:', requestError)
            setError(requestError.response?.data?.message || 'Failed to update profile.')
        } finally {
            setSaveLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (!userData) {
        return (
            <div className="text-center py-10 text-gray-500">
                {error || 'User profile not found.'}
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
                <img
                    src={userData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=6366f1&color=fff`}
                    alt={userData.name || 'Profile'}
                    className="w-28 h-28 rounded-full object-cover border-4 border-indigo-50 shadow-sm"
                />

                <div className="text-center sm:text-left space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
                    <p className="text-sm font-medium text-indigo-600">@{userData.username}</p>
                    <p className="text-sm text-gray-500">{userData.email}</p>

                    {isOwnProfile ? (
                        <button
                            onClick={openEditProfile}
                            className="mt-3 px-5 py-2 rounded-lg border border-indigo-600 text-indigo-600 text-sm font-medium hover:bg-indigo-50"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <button
                            onClick={handleFollowToggle}
                            disabled={actionLoading}
                            className="mt-3 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-50"
                        >
                            {actionLoading ? 'Please wait...' : isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                    )}
                </div>
            </div>

            <div className="py-4">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">About</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                    {userData.bio || 'No bio available yet.'}
                </p>
            </div>

            <div className="flex justify-around items-center pt-4 border-t border-gray-100 text-center">
                <div className="flex-1">
                    <span className="block text-xl font-bold text-gray-900">
                        {userData.posts?.length ?? userData.postsCount ?? 0}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">Posts</span>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="flex-1">
                    <span className="block text-xl font-bold text-gray-900">
                        {userData.followers?.length || 0}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">Followers</span>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="flex-1">
                    <span className="block text-xl font-bold text-gray-900">
                        {userData.followings?.length || 0}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">Following</span>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Followers</h3>
                    {userData.followers?.length === 0 ? (
                        <p className="text-sm text-gray-500">No followers yet.</p>
                    ) : (
                        userData.followers?.map((user) => (
                            <div key={user._id} className="py-2 border-b last:border-b-0">
                                <p className="font-medium text-sm">{user.name}</p>
                                <p className="text-xs text-gray-500">@{user.username}</p>
                            </div>
                        ))
                    )}
                </div>

                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Following</h3>
                    {userData.followings?.length === 0 ? (
                        <p className="text-sm text-gray-500">Not following anyone yet.</p>
                    ) : (
                        userData.followings?.map((user) => (
                            <div key={user._id} className="py-2 border-b last:border-b-0">
                                <p className="font-medium text-sm">{user.name}</p>
                                <p className="text-xs text-gray-500">@{user.username}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isOwnProfile && isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                                <p className="text-sm text-gray-500 mt-1">Update your profile details.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditOpen(false)}
                                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
                                aria-label="Close edit profile"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                                <div className="flex items-center gap-4">
                                    <img
                                        src={previewImage || userData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(editForm.name || 'User')}&background=6366f1&color=fff`}
                                        alt="Profile preview"
                                        className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100"
                                    />
                                    <div>
                                        <label className="inline-flex cursor-pointer items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                                            Choose Image
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                        {selectedImage && (
                                            <p className="mt-2 max-w-xs truncate text-xs text-gray-500">
                                                {selectedImage.name}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-400">Image up to 5MB.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input type="text" name="username" value={editForm.username} onChange={handleEditChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" name="email" value={editForm.email} onChange={handleEditChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea name="bio" value={editForm.bio} onChange={handleEditChange} rows="4" className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saveLoading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                                    {saveLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Profile
