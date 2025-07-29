
import React, { useState } from 'react';
import { Program, AttendanceRecord } from '../types';
import { content } from '../i18n';
import type { Lang } from '../types';
import { SCRIPT_URL } from '../constants';

// SweetAlert2 is loaded from CDN, declare it for TypeScript
declare const Swal: any;

interface CheckAttendanceProps {
  lang: Lang;
}

const CheckAttendance: React.FC<CheckAttendanceProps> = ({ lang }) => {
  const t = content[lang].checkAttendance;
  const { programs } = content[lang];
  const alerts = content[lang].alerts;

  const [selectedProgram, setSelectedProgram] = useState<Program | ''>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [results, setResults] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const program = e.target.value as Program | '';
    setSelectedProgram(program);
    setSelectedGrade(''); // Reset grade when program changes
    setResults([]);
    setHasSearched(false);
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(e.target.value);
    setResults([]);
    setHasSearched(false);
  };

  const handleSearch = async () => {
    if (!selectedProgram || !selectedGrade) {
        return;
    }

    if (SCRIPT_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE')) {
        Swal.fire(alerts.configError.title, alerts.configError.text, 'error');
        return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true);

    try {
      // Construct the URL for a GET request
      const url = new URL(SCRIPT_URL);
      url.searchParams.append('action', 'getAttendance');
      url.searchParams.append('program', selectedProgram);
      url.searchParams.append('grade', selectedGrade);

      const response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'cors',
      });

      const data = await response.json();
      
      if (data.status === 'success') {
          setResults(data.data as AttendanceRecord[]);
      } else {
          throw new Error(data.message || t.error);
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      const errorMessage = err instanceof Error ? err.message : t.error;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProgramData = programs.find(p => p.id === selectedProgram);
  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1A237E] focus:border-[#1A237E] disabled:bg-gray-100 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg mt-8">
      <h2 className="text-xl sm:text-2xl font-bold text-[#1A237E] text-center mb-6">
        {t.title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div className="md:col-span-1">
          <label htmlFor="check-program" className={labelClass}>{t.programLabel}</label>
          <select id="check-program" value={selectedProgram} onChange={handleProgramChange} className={inputClass}>
            <option value="" disabled>{t.programPlaceholder}</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-1">
          <label htmlFor="check-grade" className={labelClass}>{t.gradeLabel}</label>
          <select id="check-grade" value={selectedGrade} onChange={handleGradeChange} disabled={!selectedProgram} className={inputClass}>
            <option value="" disabled>{t.gradePlaceholder}</option>
            {selectedProgramData?.grades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-1">
          <button
            onClick={handleSearch}
            disabled={!selectedProgram || !selectedGrade || isLoading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-[#1A237E] hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? t.searchingBtn : t.searchBtn}
          </button>
        </div>
      </div>

      <div className="mt-8">
        {isLoading && (
            <div className="flex justify-center items-center p-4">
                <svg className="animate-spin h-8 w-8 text-[#1A237E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        )}
        {error && <p className="text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
        
        {hasSearched && !isLoading && !error && (
            results.length > 0 ? (
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.resultsTitle} ({results.length})</h3>
                    {/* Table for medium screens and up */}
                    <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.studentHeader}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.parentHeader}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.map((record, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{`${record.studentName.prefix} ${record.studentName.firstName} ${record.studentName.lastName}`.trim()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{`${record.parentName.prefix} ${record.parentName.firstName} ${record.parentName.lastName}`.trim()}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Cards for small screens */}
                    <div className="md:hidden space-y-3">
                        {results.map((record, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <div className="mb-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.studentHeader}</p>
                                    <p className="text-sm text-gray-900 font-medium">{`${record.studentName.prefix} ${record.studentName.firstName} ${record.studentName.lastName}`.trim()}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.parentHeader}</p>
                                    <p className="text-sm text-gray-700">{`${record.parentName.prefix} ${record.parentName.firstName} ${record.parentName.lastName}`.trim()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500 bg-gray-50 p-3 rounded-md">{t.noResults}</p>
            )
        )}
      </div>
    </div>
  );
};

export default CheckAttendance;
