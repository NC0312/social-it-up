'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2, Users, Smile, TrendingDown, TrendingUp } from 'lucide-react';

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
                const total = data.reduce((sum, item) => sum + item.count, 0);
                setTotalRatings(total);
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
                <div className="bg-[#36302A]/95 backdrop-blur-md p-4 rounded-lg shadow-xl border border-[#4A443E]">
                    <p className="text-lg font-bold text-white flex items-center gap-2">
                        <span>{payload[0].payload.emoji}</span>
                        <span>{payload[0].payload.label}</span>
                    </p>
                    <p className="text-sm text-gray-300">
                        <span>{payload[0].value} responses</span>
                        <span className="text-gray-400 ml-1">
                            ({((payload[0].value / totalRatings) * 100).toFixed(1)}%)
                        </span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }) => (
        <div className="flex flex-wrap justify-center gap-4 mt-8">
            {payload.map((entry, index) => (
                <div
                    key={`legend-${index}`}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer
                        ${hoveredIndex === index ? 'bg-[#4A443E]' : 'hover:bg-[#36302A]'}`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <span className="text-2xl">{entry.payload.emoji}</span>
                    <span className="text-sm font-medium text-gray-200">
                        {entry.payload.label}
                        <span className="ml-2 text-gray-400">
                            ({((entry.payload.count / totalRatings) * 100).toFixed(1)}%)
                        </span>
                    </span>
                </div>
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
                className="fill-white text-sm font-medium"
            >
                {ratingsData[index].emoji} {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const getMostCommonRating = () => {
        if (ratingsData.length === 0) return { emoji: '--', percentage: 0 };
        const mostCommon = ratingsData.reduce((max, curr) => curr.count > max.count ? curr : max);
        return {
            emoji: mostCommon.emoji,
            percentage: ((mostCommon.count / totalRatings) * 100).toFixed(1)
        };
    };

    const getLeastCommonRating = () => {
        if (ratingsData.length === 0) return { emoji: '--', percentage: 0 };
        const leastCommon = ratingsData.reduce((min, curr) => curr.count < min.count ? curr : min);
        return {
            emoji: leastCommon.emoji,
            percentage: ((leastCommon.count / totalRatings) * 100).toFixed(1)
        };
    };

    const mostCommon = getMostCommonRating();
    const leastCommon = getLeastCommonRating();

    return (
        <div className="min-h-screen p-4 md:p-8">
            <Card className="w-full max-w-5xl mx-auto overflow-hidden rounded-3xl border-0 bg-[#36302A] shadow-2xl">
                <CardHeader className="space-y-8 pb-8 px-6 pt-6">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2A1F3D] to-[#1F1915]">
                        <div className="absolute inset-0 opacity-20" />
                        <div className="relative p-8 md:p-12">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text">
                                    <CardTitle className="text-3xl md:text-5xl font-bold text-transparent text-center">
                                        Customer Satisfaction Metrics
                                    </CardTitle>
                                </div>
                                <p className="text-gray-400 text-center max-w-2xl text-sm md:text-base">
                                    Real-time analysis of user feedback and satisfaction ratings across our platform
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-[#4A443E] to-[#36302A] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg text-gray-300 mb-2">Total Responses</h3>
                                    <p className="text-4xl font-bold text-white">{totalRatings.toLocaleString()}</p>
                                </div>
                                <Users className="w-12 h-12 text-white/30" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-[#5A544E] to-[#36302A] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg text-gray-300 mb-2">Most Common</h3>
                                    <p className="text-4xl font-bold text-white">
                                        {mostCommon.emoji} <span className="text-xl">({mostCommon.percentage}%)</span>
                                    </p>
                                </div>
                                <TrendingUp className="w-12 h-12 text-white/30" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-[#4A443E] to-[#36302A] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg text-gray-300 mb-2">Least Common</h3>
                                    <p className="text-4xl font-bold text-white">
                                        {leastCommon.emoji} <span className="text-xl">({leastCommon.percentage}%)</span>
                                    </p>
                                </div>
                                <TrendingDown className="w-12 h-12 text-white/30" />
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 md:p-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-[400px]">
                            <Loader2 className="w-16 h-16 text-white/30 animate-spin" />
                        </div>
                    ) : (
                        <div className="h-[600px] md:h-[600px] w-full">
                            <ResponsiveContainer width="100%" height="100%" >
                                <PieChart>
                                    <Pie
                                        data={ratingsData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                        outerRadius={window.innerWidth < 768 ? 120 : 180}
                                        innerRadius={window.innerWidth < 768 ? 60 : 80}
                                        fill="#8884d8"
                                        dataKey="count"
                                        onMouseEnter={(_, index) => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        {ratingsData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.6}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend 
                                        content={<CustomLegend />}
                                        wrapperStyle={{
                                            paddingTop: window.innerWidth < 768 ? '20px' : '40px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const RatingsDashboard = dynamic(() => Promise.resolve(DynamicRatingsDashboard), {
    ssr: false
});

export default RatingsDashboard;