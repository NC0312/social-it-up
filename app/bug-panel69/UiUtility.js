import { useState } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Badge, CheckCircle } from "lucide-react";


export const DashboardSummary = ({ bugs }) => {
    // Calculate summary data
    const totalbugs = bugs.length;
    const pendingbugs = bugs.filter(r => r.clientStatus === 'Pending').length;
    const highPrioritybugs = bugs.filter(r => r.priority === 'high' || r.priority === 'highest').length;
    const unassignedbugs = bugs.filter(r => !r.assignedTo).length;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-none shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-red-700">Total bugs</p>
                            <h3 className="text-3xl font-bold text-red-900">{totalbugs}</h3>
                        </div>
                        <div className="p-3 bg-red-200 rounded-full">
                            <CheckCircle className="w-6 h-6 text-red-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-blue-700">Pending</p>
                            <h3 className="text-3xl font-bold text-blue-900">{pendingbugs}</h3>
                        </div>
                        <div className="p-3 bg-blue-200 rounded-full">
                            <AlertCircle className="w-6 h-6 text-blue-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-none shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-amber-700">High Priority</p>
                            <h3 className="text-3xl font-bold text-amber-900">{highPrioritybugs}</h3>
                        </div>
                        <div className="p-3 bg-amber-200 rounded-full">
                            <AlertCircle className="w-6 h-6 text-amber-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-none shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-purple-700">Unassigned</p>
                            <h3 className="text-3xl font-bold text-purple-900">{unassignedbugs}</h3>
                        </div>
                        <div className="p-3 bg-purple-200 rounded-full">
                            <Badge className="w-6 h-6 text-purple-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};


export const FilterAccordion = ({ children, className }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6 bg-white">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex justify-between items-center p-4 ${className} transition-colors`}
            >
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    <span className="font-medium">Filters</span>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen p-4' : 'max-h-0 p-0'
                    }`}
            >
                {children}
            </div>
        </div>
    );
};