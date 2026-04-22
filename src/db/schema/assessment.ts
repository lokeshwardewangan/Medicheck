import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { member } from './household';
import type { NextStep } from '@/types';

export const assessmentStatus = pgEnum('assessment_status', [
  'in_progress',
  'completed',
  'abandoned',
]);

export const messageRole = pgEnum('message_role', ['user', 'assistant']);

export const triageLevelEnum = pgEnum('triage_level', [
  'emergency',
  'urgent',
  'routine',
  'self_care',
]);

export const triageFeedback = pgEnum('triage_feedback', ['helpful', 'not_helpful']);

export const assessment = pgTable('assessment', {
  id: uuid('id').primaryKey().defaultRandom(),
  memberId: uuid('member_id')
    .notNull()
    .references(() => member.id, { onDelete: 'cascade' }),
  status: assessmentStatus('status').notNull().default('in_progress'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const assessmentMessage = pgTable('assessment_message', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id')
    .notNull()
    .references(() => assessment.id, { onDelete: 'cascade' }),
  role: messageRole('role').notNull(),
  content: text('content').notNull(),
  isEmergency: boolean('is_emergency').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const symptomEntry = pgTable('symptom_entry', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id')
    .notNull()
    .references(() => assessment.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  bodyPart: text('body_part'),
  severity: integer('severity').notNull(),
  duration: text('duration').notNull(),
  description: text('description'),
  recordedAt: timestamp('recorded_at').notNull().defaultNow(),
});

export const followUpAnswer = pgTable('follow_up_answer', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id')
    .notNull()
    .references(() => assessment.id, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const triageResult = pgTable('triage_result', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id')
    .notNull()
    .unique()
    .references(() => assessment.id, { onDelete: 'cascade' }),
  level: triageLevelEnum('level').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  explanation: jsonb('explanation').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  nextSteps: jsonb('next_steps').$type<NextStep[]>().notNull().default(sql`'[]'::jsonb`),
  disclaimer: text('disclaimer').notNull(),
  feedback: triageFeedback('feedback'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Assessment = typeof assessment.$inferSelect;
export type NewAssessment = typeof assessment.$inferInsert;
export type AssessmentMessage = typeof assessmentMessage.$inferSelect;
export type NewAssessmentMessage = typeof assessmentMessage.$inferInsert;
export type SymptomEntry = typeof symptomEntry.$inferSelect;
export type NewSymptomEntry = typeof symptomEntry.$inferInsert;
export type TriageResultRow = typeof triageResult.$inferSelect;
export type NewTriageResultRow = typeof triageResult.$inferInsert;
