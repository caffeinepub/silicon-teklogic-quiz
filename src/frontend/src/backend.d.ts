import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Participant {
    name: string;
    registrationNumber: string;
    email: string;
    registeredAt: bigint;
    college: string;
}
export interface Answer {
    answer: string;
    questionId: bigint;
}
export interface Question {
    id: bigint;
    subject: string;
    text: string;
    correctAnswer: string;
    questionType: QuestionType;
    options?: Array<string>;
    round: bigint;
}
export interface Submission {
    answers: Array<Answer>;
    submittedAt: bigint;
    score: bigint;
    participant: Participant;
}
export interface UserProfile {
    name: string;
    registrationNumber?: string;
    email: string;
}
export enum QuestionType {
    mcq = "mcq",
    shortAnswer = "shortAnswer"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addQuestion(question: Question): Promise<void>;
    addWhitelistedEmail(email: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteQuestion(id: bigint): Promise<void>;
    getAdminPrincipal(): Promise<Principal | null>;
    getAllParticipants(): Promise<Array<Participant>>;
    getAllQuestions(): Promise<Array<Question>>;
    getAllWhitelistedEmails(): Promise<Array<string>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExportData(): Promise<Array<[string, string, string, string, bigint, bigint]>>;
    getLeaderboard(): Promise<Array<Submission>>;
    getParticipant(registrationNumber: string): Promise<Participant>;
    getParticipantResults(registrationNumber: string): Promise<Submission>;
    getQuestionsByRound(round: bigint): Promise<Array<Question>>;
    getQuestionsBySubject(subject: string): Promise<Array<Question>>;
    getQuizResultsDetailed(registrationNumber: string): Promise<{
        answers: Array<Answer>;
        score: bigint;
        questions: Array<Question>;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControlWithSecret(password: string): Promise<void>;
    initializeSystem(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isEmailWhitelisted(email: string): Promise<boolean>;
    registerParticipant(participant: Participant): Promise<void>;
    removeWhitelistedEmail(email: string): Promise<void>;
    resetAdmin(resetPassword: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitQuiz(registrationNumber: string, answers: Array<Answer>, score: bigint): Promise<void>;
    updateQuestion(id: bigint, updatedQuestion: Question): Promise<void>;
}
