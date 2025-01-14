import apiClient from './api';

export const getQuestions = async () => {
  const response = await apiClient.get('/question');
  return response.data;
};

export const addQuestion = async (question: { title: string; content: string }) => {
  const response = await apiClient.post('/question', question);
  return response.data;
};

export const updateQuestion = async (
  id: string,
  question: { title: string; content: string }
) => {
  const response = await apiClient.patch(`/question/${id}`, question);
  return response.data;
};

export const deleteQuestion = async (id: string) => {
  const response = await apiClient.delete(`/question/${id}`);
  return response.data;
};
