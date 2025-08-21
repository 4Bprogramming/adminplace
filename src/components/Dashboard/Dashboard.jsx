"use client";
import React, { useEffect, useState } from 'react';


const BASEURL = process.env.NEXT_PUBLIC_BASEURL;
function Dashboard() {
    const [statistics, setStatistics] = useState({});

    useEffect(() => {
        fetch(`${BASEURL}/statistics`)
            .then(res => res.json())
            .then(data => setStatistics(data));
    }, []);

    return (
        <div className="w-full max-w-6xl mx-auto border p-4 sm:p-6 md:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white text-center p-6 sm:p-8 shadow rounded">
                    <h4 className="text-xl sm:text-2xl font-semibold">Total Trabajos</h4>
                    <h1 className="text-4xl sm:text-5xl font-bold">{statistics.employee_count}</h1>
                </div>

                <div className="bg-white text-center p-6 sm:p-8 shadow rounded">
                    <h4 className="text-xl sm:text-2xl font-semibold">Total Departments</h4>
                    <h1 className="text-4xl sm:text-5xl font-bold">{statistics.department_count}</h1>
                </div>

                <div className="bg-white text-center p-6 sm:p-8 shadow rounded">
                    <h4 className="text-xl sm:text-2xl font-semibold">Job Position</h4>
                    <h1 className="text-4xl sm:text-5xl font-bold">{statistics.job_count}</h1>
                </div>

                {statistics.department_wise_employee_count &&
                    statistics.department_wise_employee_count.map((dept, idx) => (
                        <div key={idx} className="bg-white text-center p-6 sm:p-8 shadow rounded">
                            <h4 className="text-xl sm:text-2xl font-semibold">{dept.department_name}</h4>
                            <h1 className="text-4xl sm:text-5xl font-bold">{dept.employee_count}</h1>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default Dashboard;