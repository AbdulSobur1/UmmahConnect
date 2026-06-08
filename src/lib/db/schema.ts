import {
  pgTable, uuid, text, boolean, integer,
  timestamp, date, unique, primaryKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  industry: text('industry'),
  careerStage: text('career_stage'),
  country: text('country').default('Nigeria').notNull(),
  city: text('city'),
  bio: text('bio'),
  skills: text('skills').array().default(sql`'{}'`),
  plan: text('plan').default('free').notNull(),
  showPhoto: boolean('show_photo').default(true).notNull(),
  openToOpportunities: boolean('open_to_opportunities').default(false).notNull(),
  avatarUrl: text('avatar_url'),
  isBanned: boolean('is_banned').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const waitlist = pgTable('waitlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  city: text('city').notNull(),
  industry: text('industry').notNull(),
  refCode: text('ref_code').unique(),
  referredBy: text('referred_by'),
  referralCount: integer('referral_count').default(0).notNull(),
  position: integer('position').notNull(),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  communityId: uuid('community_id'),
  likesCount: integer('likes_count').default(0).notNull(),
  commentsCount: integer('comments_count').default(0).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const postLikes = pgTable('post_likes', {
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.postId, t.userId] }) }));

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const communities = pgTable('communities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  icon: text('icon'),
  description: text('description'),
  isPrivate: boolean('is_private').default(false).notNull(),
  memberCount: integer('member_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const communityMembers = pgTable('community_members', {
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.communityId, t.userId] }) }));

export const connections = pgTable('connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  requesterId: uuid('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: uuid('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  senderId: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: uuid('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  isDeletedBySender: boolean('is_deleted_by_sender').default(false).notNull(),
  isDeletedByReceiver: boolean('is_deleted_by_receiver').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messageWeeklyCounts = pgTable('message_weekly_counts', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  weekStart: date('week_start').notNull(),
  count: integer('count').default(0).notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.userId, t.weekStart] }) }));

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  postedBy: uuid('posted_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  company: text('company').notNull(),
  description: text('description'),
  industry: text('industry'),
  location: text('location'),
  isRemote: boolean('is_remote').default(false).notNull(),
  jobType: text('job_type'),
  careerStage: text('career_stage'),
  salaryRange: text('salary_range'),
  isHalalVerified: boolean('is_halal_verified').default(true).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  viewsCount: integer('views_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const mentorshipProfiles = pgTable('mentorship_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  industries: text('industries').array().default(sql`'{}'`),
  languages: text('languages').array().default(sql`'{}'`),
  valuesTags: text('values_tags').array().default(sql`'{}'`),
  careerStage: text('career_stage'),
  bio: text('bio'),
  yearsExperience: integer('years_experience'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const mentorshipRequests = pgTable('mentorship_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  menteeId: uuid('mentee_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  mentorId: uuid('mentor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').default('pending').notNull(),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const eventListings = pgTable('event_listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  sponsorId: uuid('sponsor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  eventDate: date('event_date').notNull(),
  locationType: text('location_type').notNull(),
  locationDetail: text('location_detail'),
  targetIndustry: text('target_industry'),
  bannerUrl: text('banner_url'),
  isActive: boolean('is_active').default(false).notNull(),
  isPaid: boolean('is_paid').default(false).notNull(),
  viewsCount: integer('views_count').default(0).notNull(),
  clicksCount: integer('clicks_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  referenceId: uuid('reference_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  plan: text('plan').notNull(),
  paystackSubscriptionCode: text('paystack_subscription_code').unique(),
  paystackCustomerCode: text('paystack_customer_code'),
  paystackReference: text('paystack_reference').unique(),
  status: text('status').default('active').notNull(),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const rateLimits = pgTable('rate_limits', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: text('identifier').notNull(),
  action: text('action').notNull(),
  windowStart: timestamp('window_start').notNull(),
  count: integer('count').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({ unq: unique().on(t.identifier, t.action, t.windowStart) }));
