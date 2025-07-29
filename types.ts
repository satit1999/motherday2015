export enum AttendanceStatus {
  UNSELECTED = 'UNSELECTED',
  ATTENDING = 'ATTENDING',
  NOT_ATTENDING = 'NOT_ATTENDING',
}

export enum TimeSlot {
  KINDERGARTEN = 'KINDERGARTEN',
  PRIMARY_EP = 'PRIMARY_EP',
  PRIMARY_TP = 'PRIMARY_TP',
}

export enum Program {
    KINDERGARTEN = 'KINDERGARTEN',
    THAI_PROGRAMME = 'THAI_PROGRAMME',
    ENGLISH_PROGRAMME = 'ENGLISH_PROGRAMME'
}

export interface PersonName {
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
}

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  base64: string;
}

export interface FormData {
  id?: string;
  parentName: PersonName;
  studentName: PersonName;
  program: Program | '';
  studentGrade: string;
  phoneNumber: string;
  attendance: AttendanceStatus;
  timeSlot: TimeSlot | '';
  photos: UploadedFile[];
  folderPath?: string;
}

export type Lang = 'th' | 'en';

export interface AttendanceRecord {
  studentName: PersonName;
  parentName: PersonName;
}