import { Button } from "@heroui/react"
import type { FallbackProps } from "react-error-boundary"

import { EmptyState } from "./EmptyState"

export const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  const message =
    error instanceof Error
      ? error.message
      : "잠시 후 다시 시도해 주세요."

  return (
    <EmptyState tone="danger">
      <p className="font-medium">데이터를 불러오지 못했습니다.</p>
      <p className="mt-1 text-xs text-gray-500">{message}</p>
      <Button
        size="sm"
        variant="secondary"
        onPress={resetErrorBoundary}
        className="mt-3"
      >
        다시 시도
      </Button>
    </EmptyState>
  )
}
