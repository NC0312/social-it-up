'use client';
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const RatingsDashboard = () => {
    const [ratingsData, setRatingsData] = useState([]);
    const [totalRatings, setTotalRatings] = useState(0);

    useEffect(() => {
        const loadRatings = async () => {
            try {
                const ratingsRef = collection(db, 'ratings');
                const ratingsSnapshot = await getDocs(ratingsRef);
                const data = [];
                
                ratingsSnapshot.forEach((doc) => {
                    data.push(doc.data());
                });
                
                setRatingsData(data);
                setTotalRatings(data.reduce((sum, item) => sum + item.count, 0));
            } catch (error) {
                console.error('Error fetching ratings:', error);
            }
        };

        loadRatings();
    }, []);

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        
        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
            >
                {ratingsData[index].emoji} {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <Card className="w-full mt-6 max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">User Ratings Dashboard</CardTitle>
                <p className="text-center text-gray-600">Total Responses: {totalRatings}</p>
            </CardHeader>
            <CardContent>
                <div className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={ratingsData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomLabel}
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {ratingsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name, props) => [
                                    `${value} responses (${((value / totalRatings) * 100).toFixed(1)}%)`,
                                    props.payload.label
                                ]}
                            />
                            <Legend
                                formatter={(value, entry) => (
                                    <span className="text-gray-700">
                                        {entry.payload.emoji} {entry.payload.label}
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default RatingsDashboard;