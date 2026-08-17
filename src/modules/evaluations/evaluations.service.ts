import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class EvaluationsService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    );
  }

  // Crear una nueva evaluación con sus preguntas
  async createEvaluation(data: any, userId: string) {
    const { title, description, questions } = data;

    // Insertar la evaluación
    const { data: evalData, error: evalError } = await this.supabase
      .from('evaluations')
      .insert([{ title, description, created_by: userId, is_active: true }])
      .select()
      .single();

    if (evalError) throw new Error(evalError.message);

    // Insertar las preguntas
    if (questions && questions.length > 0) {
      const questionsToInsert = questions.map((q) => ({
        evaluation_id: evalData.id,
        question_text: q.question_text,
        image_url: q.image_url || null,
        options: q.options,
        correct_option_index: q.correct_option_index,
      }));

      const { error: questionsError } = await this.supabase
        .from('evaluation_questions')
        .insert(questionsToInsert);

      if (questionsError) throw new Error(questionsError.message);
    }

    return evalData;
  }

  // Obtener todas las evaluaciones (con sus preguntas sin las respuestas correctas para los estudiantes)
  async getActiveEvaluations() {
    const { data: evaluations, error: evalError } = await this.supabase
      .from('evaluations')
      .select('id, title, description')
      .eq('is_active', true);

    if (evalError) throw new Error(evalError.message);

    const result = [];

    for (const ev of evaluations) {
      const { data: questions, error: qError } = await this.supabase
        .from('evaluation_questions')
        .select('id, question_text, image_url, options')
        .eq('evaluation_id', ev.id);
      
      if (!qError) {
        result.push({ ...ev, questions });
      }
    }

    return result;
  }

  // Enviar respuestas y calcular la nota final
  async submitAnswers(evaluationId: string, answers: any[]) {
    // answers = [{ question_id: 'uuid', selected_index: 2 }, ...]
    
    // Obtener las respuestas correctas
    const { data: questions, error } = await this.supabase
      .from('evaluation_questions')
      .select('id, correct_option_index')
      .eq('evaluation_id', evaluationId);

    if (error) throw new Error(error.message);

    let correctCount = 0;
    const totalQuestions = questions.length;

    answers.forEach(ans => {
      const question = questions.find(q => q.id === ans.question_id);
      if (question && question.correct_option_index === ans.selected_index) {
        correctCount++;
      }
    });

    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0; // Nota sobre 10

    return {
      total_questions: totalQuestions,
      correct_answers: correctCount,
      score: score.toFixed(2)
    };
  }
}
