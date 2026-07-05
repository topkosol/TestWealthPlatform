import { http } from "./http";
import type { Note, Priority } from "../types";

export interface CreateNoteInput {
  text: string;
  priority: Priority;
  dueDate: string;
  clientId: string | null;
}

export function getNotes(): Promise<Note[]> {
  return http.get<Note[]>("/notes");
}

export function createNote(input: CreateNoteInput): Promise<Note> {
  return http.post<Note>("/notes", input);
}

export function toggleNote(id: string): Promise<Note> {
  return http.patch<Note>(`/notes/${id}/toggle`);
}
