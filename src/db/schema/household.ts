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
import { user } from './auth';

export const memberSex = pgEnum('member_sex', ['male', 'female', 'other']);
export const memberRelation = pgEnum('member_relation', [
  'self',
  'spouse',
  'child',
  'parent',
  'sibling',
  'other',
]);

export const household = pgTable('household', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().default('My household'),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const member = pgTable('member', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id')
    .notNull()
    .references(() => household.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  relation: memberRelation('relation').notNull().default('self'),
  age: integer('age'),
  sex: memberSex('sex'),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const memberProfile = pgTable('member_profile', {
  id: uuid('id').primaryKey().defaultRandom(),
  memberId: uuid('member_id')
    .notNull()
    .unique()
    .references(() => member.id, { onDelete: 'cascade' }),
  existingConditions: jsonb('existing_conditions')
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  medications: jsonb('medications')
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  allergies: jsonb('allergies')
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  bloodType: text('blood_type'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Household = typeof household.$inferSelect;
export type NewHousehold = typeof household.$inferInsert;
export type Member = typeof member.$inferSelect;
export type NewMember = typeof member.$inferInsert;
export type MemberProfile = typeof memberProfile.$inferSelect;
export type NewMemberProfile = typeof memberProfile.$inferInsert;
