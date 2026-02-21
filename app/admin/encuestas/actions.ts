'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type QuestionType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'date' 
  | 'image' 
  | 'single_choice' 
  | 'multiple_choice'

export interface SurveyQuestion {
  id: string
  type: QuestionType
  label: string
  required: boolean
  options?: string[] // Para single_choice y multiple_choice
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export interface Survey {
  id: number
  title: string
  description?: string
  requires_login: boolean
  is_active: boolean
  questions: SurveyQuestion[]
  created_by?: number
  created_at: string
  updated_at: string
  start_date?: string
  end_date?: string
}

export async function createSurvey(data: {
  title: string
  description?: string
  requires_login: boolean
  is_active: boolean
  questions: SurveyQuestion[]
  start_date?: string
  end_date?: string
}) {
  console.log('[v0] createSurvey - Datos recibidos:', JSON.stringify(data, null, 2))
  
  const supabase = await createClient()

  const { data: userData, error: authError } = await supabase.auth.getUser()
  console.log('[v0] createSurvey - Usuario autenticado:', userData?.user?.id, 'Error:', authError)
  
  const userId = userData?.user?.id

  if (!userId) {
    throw new Error('Usuario no autenticado')
  }

  // Obtener el ID numérico del usuario
  const { data: userRecord, error: userError } = await supabase
    .from('User')
    .select('id')
    .eq('id_supabase', userId)
    .single()

  console.log('[v0] createSurvey - User record:', userRecord, 'Error:', userError)

  const insertData = {
    title: data.title,
    description: data.description,
    requires_login: data.requires_login,
    is_active: data.is_active,
    questions: data.questions,
    created_by: userRecord?.id,
    start_date: data.start_date,
    end_date: data.end_date,
  }

  console.log('[v0] createSurvey - Datos a insertar:', JSON.stringify(insertData, null, 2))

  const { data: survey, error } = await supabase
    .from('Surveys')
    .insert(insertData)
    .select()
    .single()

  console.log('[v0] createSurvey - Resultado:', survey, 'Error:', error)

  if (error) {
    console.error('[v0] createSurvey - Error completo:', JSON.stringify(error, null, 2))
    throw error
  }

  revalidatePath('/admin/encuestas')
  revalidatePath('/encuestas')
  return survey
}

export async function updateSurvey(id: number, data: Partial<Survey>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('Surveys')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw error

  revalidatePath('/admin/encuestas')
  revalidatePath('/encuestas')
  revalidatePath(`/encuestas/${id}`)
}

export async function deleteSurvey(id: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('Surveys')
    .delete()
    .eq('id', id)

  if (error) throw error

  revalidatePath('/admin/encuestas')
  revalidatePath('/encuestas')
}

export async function getAllSurveys() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Surveys')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Survey[]
}

export async function getSurvey(id: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Surveys')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Survey
}

export async function submitSurveyResponse(
  surveyId: number,
  responses: { question_id: string; value: any }[]
) {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id

  let userIdNumeric = null
  if (userId) {
    const { data: userRecord } = await supabase
      .from('User')
      .select('id')
      .eq('id_supabase', userId)
      .single()
    userIdNumeric = userRecord?.id
  }

  const { error } = await supabase
    .from('SurveyResponses')
    .insert({
      survey_id: surveyId,
      user_id: userIdNumeric,
      responses: responses,
    })

  if (error) throw error

  revalidatePath(`/encuestas/${surveyId}`)
  revalidatePath('/admin/encuestas')
}

export async function getSurveyResponses(surveyId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('SurveyResponses')
    .select('*, User(Nombre, Apellido, Email)')
    .eq('survey_id', surveyId)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return data
}

export async function checkUserHasResponded(surveyId: number) {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id

  if (!userId) return false

  const { data: userRecord } = await supabase
    .from('User')
    .select('id')
    .eq('id_supabase', userId)
    .single()

  if (!userRecord) return false

  const { data } = await supabase
    .from('SurveyResponses')
    .select('id')
    .eq('survey_id', surveyId)
    .eq('user_id', userRecord.id)
    .single()

  return !!data
}
