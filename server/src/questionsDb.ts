import 'dotenv/config';
import { PrismaClient } from './generated/questionsDb/index.js';

let prismaQuestionsBankSingleton: PrismaClient | undefined;

export function getPrismaQuestionsBank(): PrismaClient {
  if (!prismaQuestionsBankSingleton) {
    const url =
      process.env.QUESTIONS_DATABASE_URL ?? 'file:./data/question_database.sqlite';
    prismaQuestionsBankSingleton = new PrismaClient({
      datasources: { db: { url } },
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
    });
  }
  return prismaQuestionsBankSingleton;
}
