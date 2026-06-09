import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { signupSchema } from '@/lib/validation';
import { withHandler, parseBody, ok } from '@/lib/api/helpers';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export const POST = withHandler(async (req: NextRequest) => {
  const body = await parseBody(req, signupSchema);

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, body.email))
    .limit(1);

  if (existing.length > 0) {
    throw { status: 409, message: 'An account with this email already exists.' };
  }

  const hashedPassword = await bcrypt.hash(body.password, 12);

  const industry = body.industry === 'Other' && body.industry_custom ? body.industry_custom : body.industry;

  const [user] = await db.insert(users).values({
    fullName: body.full_name,
    email: body.email,
    password: hashedPassword,
    industry,
    careerStage: body.career_stage,
    city: body.city,
    country: 'Nigeria',
    plan: body.plan,
  }).returning({ id: users.id, email: users.email });

  return ok({ id: user.id, email: user.email }, 201);
});

