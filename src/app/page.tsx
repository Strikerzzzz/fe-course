'use client';

import { useEffect, useState } from 'react';
import { getQuestions, addQuestion, updateQuestion, deleteQuestion } from './services/questionApi';

interface Question {
  id: string;
  type: 'multipleChoice' | 'fillInTheBlank';
  content: string;
  options?: { option: string; isCorrect: boolean }[];
  correctAnswer?: string;
  hint?: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reference: {
    id: string;
    referenceType: 'exam' | 'quiz';
  };
}

export default function QuestionPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState<'add' | 'edit'>('add');
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>| any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const data = await getQuestions();
    setQuestions(data);
  };

  const handleSaveQuestion = async () => {
    if (!currentQuestion.content || !currentQuestion.type || !currentQuestion.difficulty) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const questionPayload = {
      type: currentQuestion.type,
      content: currentQuestion.content,
      options:
        currentQuestion.type === 'multipleChoice'
          ? currentQuestion.options || []
          : undefined,
      correctAnswer:
        currentQuestion.type === 'fillInTheBlank'
          ? currentQuestion.correctAnswer || ''
          : undefined,
      hint: currentQuestion.hint || '',
      explanation: currentQuestion.explanation || '',
      difficulty: currentQuestion.difficulty,
      reference: {
        id: '64b6245b8f1234567890abcd', // Thay bằng ID thực tế từ backend
        referenceType: 'quiz', // Hoặc 'exam', tùy thuộc vào logic
      },
    };

    if (popupMode === 'add') {
      await addQuestion(questionPayload);
    } else if (popupMode === 'edit' && currentQuestion.id) {
      await updateQuestion(currentQuestion.id, questionPayload);
    }

    setShowPopup(false);
    fetchQuestions();
  };

  const handleDeleteQuestion = async () => {
    if (deleteId) {
      await deleteQuestion(deleteId);
      setDeleteId(null);
      fetchQuestions();
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-6">Danh sách câu hỏi</h1>
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2">Loại</th>
            <th className="border px-4 py-2">Nội dung</th>
            <th className="border px-4 py-2">Độ khó</th>
            <th className="border px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{question.type}</td>
              <td className="border px-4 py-2">{question.content}</td>
              <td className="border px-4 py-2">{question.difficulty}</td>
              <td className="border px-4 py-2 flex gap-2 justify-center">
                <button
                  className="edit bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => {
                    setPopupMode('edit');
                    setCurrentQuestion(question);
                    setShowPopup(true);
                  }}
                >
                  Sửa
                </button>
                <button
                  className="delete bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => setDeleteId(question.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="add bg-green-500 text-white px-4 py-2 rounded mt-6"
        onClick={() => {
          setPopupMode('add');
          setCurrentQuestion({ type: 'multipleChoice', difficulty: 'easy' });
          setShowPopup(true);
        }}
      >
        Thêm câu hỏi
      </button>

      {/* Popup Form */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl mb-4">{popupMode === 'add' ? 'Thêm Câu Hỏi' : 'Sửa Câu Hỏi'}</h2>
            <select
              className="border rounded px-4 py-2 w-full mb-4"
              value={currentQuestion.type || ''}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
            >
              <option value="multipleChoice">Trắc nghiệm</option>
              <option value="fillInTheBlank">Điền từ</option>
            </select>
            <input
              className="border rounded px-4 py-2 w-full mb-4"
              placeholder="Nội dung"
              value={currentQuestion.content || ''}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, content: e.target.value })}
            />
            {currentQuestion.type === 'multipleChoice' && (
              <div>
                <h3 className="text-lg mb-2">Lựa chọn</h3>
                {(currentQuestion.options || []).map((option:Partial<Question>|any, index:number) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      className="border rounded px-2 py-1 flex-1"
                      placeholder="Lựa chọn"
                      value={option.option}
                      onChange={(e) => {
                        const newOptions = [...(currentQuestion.options || [])];
                        newOptions[index].option = e.target.value;
                        setCurrentQuestion({ ...currentQuestion, options: newOptions });
                      }}
                    />
                    <input
                      type="checkbox"
                      checked={option.isCorrect}
                      onChange={(e) => {
                        const newOptions = [...(currentQuestion.options || [])];
                        newOptions[index].isCorrect = e.target.checked;
                        setCurrentQuestion({ ...currentQuestion, options: newOptions });
                      }}
                    />
                  </div>
                ))}
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                  onClick={() => {
                    const newOptions = [...(currentQuestion.options || []), { option: '', isCorrect: false }];
                    setCurrentQuestion({ ...currentQuestion, options: newOptions });
                  }}
                >
                  Thêm lựa chọn
                </button>
              </div>
            )}
            {currentQuestion.type === 'fillInTheBlank' && (
              <input
                className="border rounded px-4 py-2 w-full mb-4"
                placeholder="Câu trả lời đúng"
                value={currentQuestion.correctAnswer || ''}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
              />
            )}
            <input
              className="border rounded px-4 py-2 w-full mb-4"
              placeholder="Gợi ý"
              value={currentQuestion.hint || ''}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, hint: e.target.value })}
            />
            <input
              className="border rounded px-4 py-2 w-full mb-4"
              placeholder="Giải thích"
              value={currentQuestion.explanation || ''}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
            />
            <select
              className="border rounded px-4 py-2 w-full mb-4"
              value={currentQuestion.difficulty || ''}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, difficulty: e.target.value })}
            >
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowPopup(false)}
              >
                Hủy
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleSaveQuestion}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl mb-4">Xóa Câu Hỏi</h2>
            <p>Bạn có chắc chắn muốn xóa câu hỏi này?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setDeleteId(null)}
              >
                Hủy
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleDeleteQuestion}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
