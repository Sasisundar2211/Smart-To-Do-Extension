export interface Task {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  priority?: number;
  completed?: boolean;
  contextUrl?: string;
  tags?: string[];
}
