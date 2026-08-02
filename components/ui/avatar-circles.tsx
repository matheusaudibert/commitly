"use client"

import { cn } from "@/lib/utils"

interface Avatar {
  imageUrl: string
  profileUrl: string
}
interface AvatarCirclesProps {
  className?: string
  numPeople?: number
  avatarUrls: Avatar[]
}

export const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
}: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-3 rtl:space-x-reverse", className)}>
      {avatarUrls.map((url, index) => (
        <a
          key={index}
          href={url.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative transition-transform duration-200 ease-out hover:z-20 hover:-translate-y-1.5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="size-12 cursor-pointer rounded-full border-2 border-background"
            src={url.imageUrl}
            width={48}
            height={48}
            alt={`Avatar ${index + 1}`}
          />
        </a>
      ))}
      {(numPeople ?? 0) > 0 && (
        <span className="relative flex size-12 items-center justify-center rounded-full border-2 border-background bg-primary text-center text-sm font-medium text-primary-foreground">
          +{numPeople}
        </span>
      )}
    </div>
  )
}
