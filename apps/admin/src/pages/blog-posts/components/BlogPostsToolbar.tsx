import { Input } from "@heroui/react"

import { FlexBox } from "@/shared/ui/FlexBox"

type BlogPostsToolbarProps = {
  searchText: string
  onSearchTextChange: (value: string) => void
}

export const BlogPostsToolbar = ({
  searchText,
  onSearchTextChange,
}: BlogPostsToolbarProps) => {
  return (
    <FlexBox className="justify-between">
      <Input
        variant="secondary"
        placeholder="제목 검색..."
        className="max-w-xs"
        value={searchText}
        onChange={(e) => onSearchTextChange(e.target.value)}
      />
    </FlexBox>
  )
}
