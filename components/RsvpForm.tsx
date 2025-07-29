
import React, { useState, useCallback, ChangeEvent, DragEvent } from 'react';
import { FormData, AttendanceStatus, UploadedFile, Program, TimeSlot } from '../types';
import { MAX_FILE_SIZE_BYTES, ALLOWED_FILE_TYPES, MAX_FILES, SCRIPT_URL } from '../constants';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { content } from '../i18n';
import type { Lang } from '../types';


// SweetAlert2 is loaded from CDN, declare it for TypeScript
declare const Swal: any;

interface RsvpFormProps {
    lang: Lang;
}

const RsvpForm: React.FC<RsvpFormProps> = ({ lang }) => {
  const t = content[lang].form;
  const alerts = content[lang].alerts;
  const schedule = content[lang].schedule;
  const programs = content[lang].programs;
  const { parentPrefixes, studentPrefixes } = content[lang];

  const initialFormData: FormData = {
    parentName: { prefix: '', firstName: '', middleName: '', lastName: '' },
    studentName: { prefix: '', firstName: '', middleName: '', lastName: '' },
    program: '',
    studentGrade: '',
    phoneNumber: '',
    attendance: AttendanceStatus.UNSELECTED,
    timeSlot: '',
    photos: [],
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, personType: 'parentName' | 'studentName') => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [personType]: {
        ...prev[personType],
        [name]: value,
      },
    }));
  };

  const handleProgramChange = (program: Program) => {
    // A map to link programs to their specific time slots
    const programToTimeSlotMap: Record<Program, TimeSlot> = {
        [Program.KINDERGARTEN]: TimeSlot.KINDERGARTEN,
        [Program.THAI_PROGRAMME]: TimeSlot.PRIMARY_TP,
        [Program.ENGLISH_PROGRAMME]: TimeSlot.PRIMARY_EP,
    };

    const newTimeSlot = programToTimeSlotMap[program];

    setFormData(prev => ({
        ...prev,
        program: program,
        studentGrade: '', // Reset grade when program changes
        timeSlot: newTimeSlot, // Automatically set the corresponding time slot
    }));
  };
  
  const handleAttendanceChange = (status: AttendanceStatus) => {
    setFormData(prev => ({
        ...prev,
        attendance: status,
        timeSlot: status === AttendanceStatus.NOT_ATTENDING ? '' : prev.timeSlot,
        photos: status === AttendanceStatus.NOT_ATTENDING ? [] : prev.photos,
    }));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]); // remove prefix
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    const currentFileCount = formData.photos.length;

    if (files.length + currentFileCount > MAX_FILES) {
        Swal.fire({
            icon: 'error',
            title: alerts.fileTooMany.title,
            text: alerts.fileTooMany.text,
            confirmButtonColor: '#1A237E',
        });
        return;
    }

    for (const file of Array.from(files)) {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            Swal.fire({
                icon: 'error',
                title: alerts.fileUnsupported.title,
                text: alerts.fileUnsupported.text,
                confirmButtonColor: '#1A237E',
            });
            continue;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            Swal.fire({
                icon: 'error',
                title: alerts.fileTooLarge.title,
                text: alerts.fileTooLarge.text,
                confirmButtonColor: '#1A237E',
            });
            continue;
        }
        const base64 = await fileToBase64(file);
        newFiles.push({ name: file.name, type: file.type, size: file.size, base64 });
    }

    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...newFiles] }));
  }, [formData.photos, alerts]);
  
  const handleDrag = (e: DragEvent<HTMLFormElement | HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
        ...prev,
        photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    if (SCRIPT_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE')) {
        Swal.fire(alerts.configError.title, alerts.configError.text, 'error');
        return false;
    }
    const { parentName, studentName, program, studentGrade, attendance, timeSlot } = formData;
    if (
        !parentName.prefix || !parentName.firstName || !parentName.lastName ||
        !studentName.prefix || !studentName.firstName || !studentName.lastName
    ) {
        Swal.fire(alerts.formIncomplete.title, alerts.formIncomplete.text, 'warning');
        return false;
    }
    if (!program) {
        Swal.fire(alerts.programUnselected.title, alerts.programUnselected.text, 'warning');
        return false;
    }
     if (!studentGrade) {
        Swal.fire(alerts.gradeUnselected.title, alerts.gradeUnselected.text, 'warning');
        return false;
    }
    if (attendance === AttendanceStatus.UNSELECTED) {
        Swal.fire(alerts.attendanceUnselected.title, alerts.attendanceUnselected.text, 'warning');
        return false;
    }
    if (attendance === AttendanceStatus.ATTENDING && !timeSlot) {
        Swal.fire(alerts.timeSlotUnselected.title, alerts.timeSlotUnselected.text, 'warning');
        return false;
    }
    return true;
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    // Helper function to build the folder path for Google Drive
    const buildFolderPath = (data: FormData): string => {
        const root = 'กิจกรรมวันแม่';
        let programFolder = '';
        let intermediateFolder = '';

        switch(data.program) {
            case Program.KINDERGARTEN:
                programFolder = 'ระดับชั้นอนุบาล (รวมทั้ง TP และ EP)';
                break;
            case Program.THAI_PROGRAMME:
                programFolder = 'Thai Programme';
                intermediateFolder = 'ระดับชั้นประถม–มัธยม';
                break;
            case Program.ENGLISH_PROGRAMME:
                programFolder = 'English Programme';
                intermediateFolder = 'ระดับชั้นประถม–มัธยม';
                break;
        }

        const gradeFolder = data.studentGrade;
        // Construct student name and clean up any extra spaces
        const studentFolder = `${data.studentName.prefix} ${data.studentName.firstName} ${data.studentName.lastName}`.trim().replace(/\s\s+/g, ' ');

        // Combine parts, filtering out any empty ones
        const parts = [root, programFolder, intermediateFolder, gradeFolder, studentFolder].filter(Boolean);
        return parts.join('/');
    };

    const submissionData = {
        ...formData,
        folderPath: buildFolderPath(formData),
    };

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Use text/plain for Apps Script POST
        },
        body: JSON.stringify(submissionData), // Send data with folderPath
      });
      
      const result = await response.json();

      if (result.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: alerts.submitSuccess.title,
          html: alerts.submitSuccess.html,
          confirmButtonText: alerts.submitSuccess.confirmButtonText,
          confirmButtonColor: '#1A237E',
        });
        setFormData(initialFormData);
      } else {
        throw new Error(result.message || 'Unknown error occurred on the server.');
      }
    } catch (error) {
        console.error("Submission failed:", error);
        const errorMessage = error instanceof Error ? error.message : alerts.submitError.text;
        Swal.fire({
            icon: 'error',
            title: alerts.submitError.title,
            text: errorMessage,
            confirmButtonColor: '#1A237E',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const selectedProgramData = programs.find(p => p.id === formData.program);
  const selectedTimeSlot = schedule.find(slot => slot.id === formData.timeSlot);
  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1A237E] focus:border-[#1A237E]";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-[#1A237E] text-center">
        {t.title}
      </h2>
      <p className="text-center text-red-600 font-semibold mt-2 mb-6">
        {t.deadline}
      </p>

      <form onSubmit={handleSubmit} onDragEnter={handleDrag} className="space-y-6">
        {/* Personal Info */}
        <div className="space-y-8">
            <fieldset className="space-y-4 border border-gray-200 p-4 rounded-lg">
                <legend className="text-lg font-semibold text-[#1A237E] px-2">{t.parentNameSectionLabel}</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                    <div>
                        <label htmlFor="parentPrefix" className={labelClass}>{t.prefixLabel} <span className="text-red-500">{t.required}</span></label>
                        <select id="parentPrefix" name="prefix" value={formData.parentName.prefix} onChange={(e) => handleNameChange(e, 'parentName')} required className={inputClass}>
                           <option value="" disabled>{t.prefixPlaceholder}</option>
                           {parentPrefixes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="parentFirstName" className={labelClass}>{t.firstNameLabel} <span className="text-red-500">{t.required}</span></label>
                        <input type="text" id="parentFirstName" name="firstName" value={formData.parentName.firstName} onChange={(e) => handleNameChange(e, 'parentName')} required className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="parentMiddleName" className={labelClass}>{t.middleNameLabel}</label>
                        <input type="text" id="parentMiddleName" name="middleName" value={formData.parentName.middleName} onChange={(e) => handleNameChange(e, 'parentName')} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="parentLastName" className={labelClass}>{t.lastNameLabel} <span className="text-red-500">{t.required}</span></label>
                        <input type="text" id="parentLastName" name="lastName" value={formData.parentName.lastName} onChange={(e) => handleNameChange(e, 'parentName')} required className={inputClass} />
                    </div>
                </div>
            </fieldset>

            <fieldset className="space-y-4 border border-gray-200 p-4 rounded-lg">
                <legend className="text-lg font-semibold text-[#1A237E] px-2">{t.studentNameSectionLabel}</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                    <div>
                        <label htmlFor="studentPrefix" className={labelClass}>{t.prefixLabel} <span className="text-red-500">{t.required}</span></label>
                        <select id="studentPrefix" name="prefix" value={formData.studentName.prefix} onChange={(e) => handleNameChange(e, 'studentName')} required className={inputClass}>
                           <option value="" disabled>{t.prefixPlaceholder}</option>
                           {studentPrefixes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="studentFirstName" className={labelClass}>{t.firstNameLabel} <span className="text-red-500">{t.required}</span></label>
                        <input type="text" id="studentFirstName" name="firstName" value={formData.studentName.firstName} onChange={(e) => handleNameChange(e, 'studentName')} required className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="studentMiddleName" className={labelClass}>{t.middleNameLabel}</label>
                        <input type="text" id="studentMiddleName" name="middleName" value={formData.studentName.middleName} onChange={(e) => handleNameChange(e, 'studentName')} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="studentLastName" className={labelClass}>{t.lastNameLabel} <span className="text-red-500">{t.required}</span></label>
                        <input type="text" id="studentLastName" name="lastName" value={formData.studentName.lastName} onChange={(e) => handleNameChange(e, 'studentName')} required className={inputClass} />
                    </div>
                </div>
            </fieldset>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t.programLabel} <span className="text-red-500">{t.required}</span></label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {programs.map((prog) => (
                <button type="button" key={prog.id} onClick={() => handleProgramChange(prog.id)} className={`flex items-center justify-center text-center p-3 rounded-lg border-2 transition-all duration-200 text-sm font-semibold ${formData.program === prog.id ? 'border-[#1A237E] bg-indigo-50 text-[#1A237E]' : 'border-gray-300 bg-gray-50 text-gray-600 hover:bg-indigo-50'}`}>
                    {prog.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="studentGrade" className={labelClass}>{t.gradeLabel} <span className="text-red-500">{t.required}</span></label>
              <select name="studentGrade" id="studentGrade" value={formData.studentGrade} onChange={handleInputChange} disabled={!formData.program} required className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}>
                  <option value="" disabled>{t.gradePlaceholder}</option>
                  {selectedProgramData?.grades.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                  ))}
              </select>
            </div>
            <div>
              <label htmlFor="phoneNumber" className={labelClass}>{t.phoneLabel}</label>
              <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder={t.phonePlaceholder} className={inputClass} />
            </div>
          </div>
        </div>
        
        {/* Attendance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.attendanceLabel} <span className="text-red-500">{t.required}</span></label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button type="button" onClick={() => handleAttendanceChange(AttendanceStatus.ATTENDING)} className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${formData.attendance === AttendanceStatus.ATTENDING ? 'border-[#1A237E] bg-indigo-50 text-[#1A237E]' : 'border-gray-300 bg-gray-50 text-gray-600 hover:bg-indigo-50'}`}>
              <CheckCircleIcon className="w-6 h-6 mr-3" />
              <span className="font-semibold">{t.attendingBtn}</span>
            </button>
            <button type="button" onClick={() => handleAttendanceChange(AttendanceStatus.NOT_ATTENDING)} className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${formData.attendance === AttendanceStatus.NOT_ATTENDING ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-300 bg-gray-50 text-gray-600 hover:bg-red-50'}`}>
              <XCircleIcon className="w-6 h-6 mr-3" />
              <span className="font-semibold">{t.notAttendingBtn}</span>
            </button>
          </div>
        </div>

        {/* Conditional Fields */}
        {formData.attendance === AttendanceStatus.ATTENDING && (
          <div className="space-y-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div>
                <label className="block text-sm font-medium text-gray-700">{t.timeSlotLabel} <span className="text-red-500">{t.required}</span></label>
                {formData.program && selectedTimeSlot ? (
                    <div className="mt-2 p-3 bg-white border border-gray-300 rounded-md shadow-sm">
                        <p className="font-semibold text-[#1A237E]">{selectedTimeSlot.label}</p>
                        <p className="text-gray-600">{selectedTimeSlot.time}</p>
                    </div>
                ) : (
                    <div className="mt-2 p-3 bg-gray-100 border border-gray-200 rounded-md text-gray-500 italic">
                        {t.timeSlotPlaceholder}
                    </div>
                )}
            </div>
            
             {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">{t.photoUploadLabel}</label>
              <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 ${dragActive ? 'border-[#1A237E] bg-indigo-100' : 'border-gray-300'} border-dashed rounded-md`}>
                <div className="space-y-1 text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#1A237E] hover:text-indigo-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>{t.uploadInstruction1}</span>
                      <input id="file-upload" name="file-upload" type="file" multiple accept={ALLOWED_FILE_TYPES.join(',')} onChange={(e) => handleFileChange(e.target.files)} className="sr-only" />
                    </label>
                    <p className="pl-1">{t.uploadInstruction2}</p>
                  </div>
                  <p className="text-xs text-gray-500">{t.uploadHint}</p>
                </div>
              </div>
            </div>

            {/* Photo Previews */}
            {formData.photos.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.photos.map((photo, index) => (
                        <div key={index} className="relative group border rounded-lg p-2 bg-gray-50">
                            <img src={`data:${photo.type};base64,${photo.base64}`} alt={photo.name} className="w-full h-32 object-cover rounded-md" />
                            <div className="text-xs truncate mt-2 text-gray-600">{photo.name}</div>
                            <button type="button" onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-50 group-hover:opacity-100 transition-opacity" aria-label={`Remove ${photo.name}`}>
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-[#1A237E] hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? t.submittingBtn : t.submitBtn}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RsvpForm;
