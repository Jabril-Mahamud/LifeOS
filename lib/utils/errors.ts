import { Prisma } from "@prisma/client";

// Error codes
export const ErrorCode = {
  UNIQUE_CONSTRAINT: "P2002",
  FOREIGN_KEY: "P2003",
  NOT_FOUND: "P2025",
} as const;

// Error messages
export const ErrorMessage = {
  UNIQUE_CONSTRAINT: {
    "Project_authorId_name_key": "A project with this name already exists",
    "Habit_authorId_name_key": "A habit with this name already exists",
    "Journal_authorId_date_key": "A journal entry for this date already exists",
  },
  FOREIGN_KEY: "Referenced record not found",
  NOT_FOUND: "Record not found",
  UNAUTHORIZED: "Unauthorized",
  INTERNAL_SERVER: "Internal server error",
} as const;

// Handle Prisma errors
export function handlePrismaError(error: unknown): { status: number; message: string } {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case ErrorCode.UNIQUE_CONSTRAINT: {
        const target = error.meta?.target as string[];
        const constraint = target?.join("_");
        return {
          status: 409,
          message: ErrorMessage.UNIQUE_CONSTRAINT[constraint as keyof typeof ErrorMessage.UNIQUE_CONSTRAINT] || "Resource already exists",
        };
      }
      case ErrorCode.FOREIGN_KEY:
        return {
          status: 400,
          message: ErrorMessage.FOREIGN_KEY,
        };
      case ErrorCode.NOT_FOUND:
        return {
          status: 404,
          message: ErrorMessage.NOT_FOUND,
        };
      default:
        return {
          status: 500,
          message: ErrorMessage.INTERNAL_SERVER,
        };
    }
  }

  return {
    status: 500,
    message: ErrorMessage.INTERNAL_SERVER,
  };
}