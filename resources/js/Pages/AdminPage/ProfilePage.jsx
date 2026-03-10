import React, { useState } from "react";
import { Sidebar } from "@/Components/AdminPage/Sidebar";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: "John Doe",
        email: "john@example.com",
        phone: "012-3456789",
        address: "123, Jalan Example, Kuala Lumpur",
        image: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfile((prev) => ({
                ...prev,
                image: URL.createObjectURL(file),
            }));
        }
    };

    const handleSave = () => {
        setIsEditing(false);
        // You can send `profile` data to API here
        console.log("Saved profile:", profile);
    };

    return (
        <div className="flex min-h-screen bg-gray-100 text-black">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow hidden md:block">
                <div className="p-6 font-bold text-lg text-indigo-700">
                    Admin Panel
                </div>
                <Sidebar />
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6">
                <h2 className="text-3xl font-semibold mb-8 text-gray-800 text-center">
                    User Profile
                </h2>

                <div className="flex flex-col lg:flex-row gap-8 items-center">
                    {/* Profile Picture */}
                    <div className="relative group w-40 h-40">
                        <img
                            src={
                                profile.image ||
                                "https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff"
                            }
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full border-4 border-gray-200 shadow-md"
                        />
                        <label
                            htmlFor="imageUpload"
                            className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            Change
                            <input
                                id="imageUpload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Form */}
                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    disabled={!isEditing}
                                    onChange={handleChange}
                                    className={`mt-1 w-full px-4 py-2 border ${
                                        isEditing
                                            ? "border-gray-300 bg-white"
                                            : "border-transparent bg-gray-100"
                                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    disabled={!isEditing}
                                    onChange={handleChange}
                                    className={`mt-1 w-full px-4 py-2 border ${
                                        isEditing
                                            ? "border-gray-300 bg-white"
                                            : "border-transparent bg-gray-100"
                                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={profile.phone}
                                    disabled={!isEditing}
                                    onChange={handleChange}
                                    className={`mt-1 w-full px-4 py-2 border ${
                                        isEditing
                                            ? "border-gray-300 bg-white"
                                            : "border-transparent bg-gray-100"
                                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                                />
                            </div>

                            {/* Address */}
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    rows="3"
                                    value={profile.address}
                                    disabled={!isEditing}
                                    onChange={handleChange}
                                    className={`mt-1 w-full px-4 py-2 border ${
                                        isEditing
                                            ? "border-gray-300 bg-white"
                                            : "border-transparent bg-gray-100"
                                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                                ></textarea>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="mt-8 flex justify-end space-x-3">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
                                    >
                                        Save
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
