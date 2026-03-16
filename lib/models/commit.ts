import mongoose, { Document, Schema, Types } from "mongoose"

export interface ICommit extends Document {
  userId: Types.ObjectId
  githubId: string
  message: string
  commitSha: string
  sequence: number
  createdAt: Date
}

const CommitSchema = new Schema<ICommit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    githubId: { type: String, required: true, index: true },
    message: { type: String, required: true },
    commitSha: { type: String, required: true },
    sequence: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const Commit =
  mongoose.models.Commit ?? mongoose.model<ICommit>("Commit", CommitSchema)
