import { api } from "@/lib/api";

export type SubmissionRecordDto = {
  id: string;
  requester_user_id: string;
  requester_role: "CUSTOMER" | "VENDOR";
  submission_kind: "SUPPORT" | "FEEDBACK";
  topic: string;
  subject: string;
  message: string;
  status: "NEW" | "RESOLVED" | "CLOSED";
  created_at: string;
  updated_at: string;
};

export const submissionsService = {
  createSupport(payload: { topic: string; subject: string; message: string }) {
    return api.post<SubmissionRecordDto>("/api/v1/submissions/support", payload);
  },
  createFeedback(payload: { category: "feedback" | "feature" | "complaint" | "bug"; subject: string; message: string }) {
    return api.post<SubmissionRecordDto>("/api/v1/submissions/feedback", payload);
  },
};
