import { axios } from "@/lib/axios";
import type { ErrorType } from "../type";

interface TableRow {
  id: number;
  name: string;
  studentId: string;
  subject: string;
  score: number;
  examBatch: string;
}

type StudentsInfoParam = {
  currentPage: number;
  pageSize: number;
};

interface StudentsInfoResponse extends ErrorType {
  message: string;
  data: TableRow[];
}

export const studentsInfo = (data: StudentsInfoParam): Promise<StudentsInfoResponse> => {
  return axios.post("/api/stuentsInfo", data);
};

export const studentsInfoError = (data: StudentsInfoParam): Promise<StudentsInfoResponse> => {
  return axios.post("/api/stuentsInfoError", data);
};

//
