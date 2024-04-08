import type { InferSelectModel } from 'drizzle-orm';
import { comments } from './schema';

export type Comment = InferSelectModel<typeof comments>;
