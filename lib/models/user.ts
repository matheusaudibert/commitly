import mongoose, { Document, Schema } from "mongoose"

export interface IUser extends Document {
  githubId: string
  username: string
  email: string
  accessToken: string
  avatarUrl: string
  repoName: string | null
  repoId: number | null
  repoSetupComplete: boolean
  totalCommits: number
  dailyCommitsCount: number
  lastCommitAt: Date | null
  dailyResetAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    githubId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    email: { type: String, default: "" },
    accessToken: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    repoName: { type: String, default: null },
    repoId: { type: Number, default: null },
    repoSetupComplete: { type: Boolean, default: false },
    totalCommits: { type: Number, default: 0 },
    dailyCommitsCount: { type: Number, default: 0 },
    lastCommitAt: { type: Date, default: null },
    dailyResetAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const User = mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema)
