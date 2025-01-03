'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { Loader2, Users, Smile, BarChart } from 'lucide-react';

// Prevent hydration error by using client-only render for the entire chart
const DynamicRatingsDashboard = () => {
    const [ratingsData, setRatingsData] = useState([]);
    const [totalRatings, setTotalRatings] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredIndex, setHoveredIndex] = useState(null);

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
            } finally {
                setIsLoading(false);
            }
        };

        loadRatings();
    }, []);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-lg shadow-lg border border-gray-100">
                    <p className="text-lg font-bold font-serif flex items-center gap-2">
                        <span>{payload[0].payload.emoji}</span>
                        <span>{payload[0].payload.label}</span>
                    </p>
                    <p className="text-sm font-serif text-gray-600">
                        <span>{payload[0].value} responses</span>
                        <span className="text-gray-400 font-serif ml-1">
                            ({((payload[0].value / totalRatings) * 100).toFixed(1)}%)
                        </span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }) => (
        <div className="flex justify-center gap-4 mt-4">
            {payload.map((entry, index) => (
                <motion.div
                    key={`legend-${index}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span className="text-xl font-serif">{entry.payload.emoji}</span>
                    <span className="text-sm font-serif font-medium text-gray-700">
                        {entry.payload.label}
                    </span>
                </motion.div>
            ))}
        </div>
    );

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="fill-white font-serif text-sm font-medium"
            >
                {ratingsData[index].emoji} {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="px-4 py-16">
            <Card className="w-full max-w-4xl mx-auto overflow-hidden rounded-2xl border-0 px-5 py-5">
                <CardHeader className="space-y-6 pb-8">
                    <div className="relative overflow-hidden rounded-xl p-6 bg-[#36302A]">
                        <CardTitle className="text-3xl md:text-4xl font-serif font-medium text-center text-white">
                            User Ratings Analytics
                        </CardTitle>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-[#36302A] to-[#4A443E] font-serif p-4 rounded-xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium opacity-80">Total Responses</h3>
                                    <p className="text-3xl font-bold">{totalRatings}</p>
                                </div>
                                <Users className="w-10 h-10 opacity-50" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-[#5A544E] to-[#36302A] font-serif p-4 rounded-xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium opacity-80">Most Common</h3>
                                    <p className="text-3xl font-bold">
                                        {ratingsData.length > 0
                                            ? ratingsData.reduce((max, curr) => curr.count > max.count ? curr : max).emoji
                                            : '--'
                                        }
                                    </p>
                                </div>
                                <Smile className="w-10 h-10 opacity-50" />
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-[400px]">
                            <Loader2 className="w-12 h-12 text-[#36302A] animate-spin" />
                        </div>
                    ) : (
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
                                        onMouseEnter={(_, index) => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        {ratingsData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend content={<CustomLegend />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

// Create a dynamic component with SSR disabled
const RatingsDashboard = dynamic(() => Promise.resolve(DynamicRatingsDashboard), {
    ssr: false
});

export default RatingsDashboard;