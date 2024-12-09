'use client';
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const AdminPanel = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Firestore
  const fetchInquiries = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "inquiries"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Include document ID for uniqueness
        ...doc.data(),
      }));
      setInquiries(data);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : inquiries.length > 0 ? (
        <table className="table-auto w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border px-4 py-2">First Name</th>
              <th className="border px-4 py-2">Last Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Phone Number</th>
              <th className="border px-4 py-2">Company</th>
              <th className="border px-4 py-2">Website</th>
              <th className="border px-4 py-2">Time</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id}>
                <td className="border px-4 py-2">{inquiry.firstName}</td>
                <td className="border px-4 py-2">{inquiry.lastName}</td>
                <td className="border px-4 py-2">{inquiry.email}</td>
                <td className="border px-4 py-2">{inquiry.phoneNumber}</td>
                <td className="border px-4 py-2">{inquiry.company}</td>
                <td className="border px-4 py-2">{inquiry.website}</td>
                <td className="border px-4 py-2">
                  {new Date(inquiry.timestamp?.seconds * 1000).toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => console.log("Delete", inquiry.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No inquiries found.</p>
      )}
    </div>
  );
};

export default AdminPanel;
